# Runtime

The Runtime Engine is responsible for managing the game state and scene resources. It is important to understand that both the editor and the in-game environment operate within the runtime.

Typically, the Runtime Engine initiates as soon as we start the editor and continues to operate until the editor is closed. When we initiate the in-game runtime, we are essentially launching a separate Runtime Engine parallel to the editor's Runtime Engine. Each of these engines manages unique runtime states.

Upon initializing a runtime instance, the Entity-Component-System (ECS) automatically starts up to manage the state.

### **About ECS system**:

The Entity Component System (ECS) is a programming paradigm that follows a data-oriented design, contrasting with the traditionally dominant Object-Oriented Programming (OOP) approach used in game engine development. Historically, OOP has been prevalent, but it can result in data being dispersed throughout memory, which presents challenges for the CPU in retrieving data efficiently. ECS addresses this issue by organizing data in a manner that is more compact and contiguous in underlying memory, thereby enhancing CPU cache coherency and data access efficiency.

Imagine creating a game scene after successfully importing a glTF asset. The first step involves loading the asset into the scene. However, it is not feasible to directly load a glTF file into the runtime using a third-party glTF loader. One reason for this is the potential reusability of some assets within the glTF, such as textures and meshes. We would want to duplicate these assets in our runtime scene to increase complexity. For instance, if we have a glTF file for a rock and wish to place 100 identical rocks into the scene, loading this glTF using a third-party loader would require calling the load function 100 times. Moreover, it would prevent us from reusing textures from this glTF for other meshes from another glTF.

Our engine implements a solution to this problem using a runtime loading program referred to as a .meta file loader. The .meta file of a glTF can represent the scene structure of that glTF, as well as references to its metadata. Once a glTF asset passes through the Asset IO Engine pipeline, it is parsed into several other pieces of metadata, such as texture.meta.

Loading a prefab first involves reading the prefab's .meta file. This action extracts the basic hierarchical structure of the prefab, and creates GameObject nodes based on this structure. It then reads the corresponding components connected to each of these nodes and registers them into the ECS. This procedure also feeds the component data into the ECS. For instance, after recreating the node graph from the prefab meta, the next step is to register the mesh component into the ECS. We load the mesh binary data from the disk, based on the reference file path in the meta file, and link the mesh component to its corresponding entity. Subsequently, when the render or physics engine requests scene data, the state management program only sends one copy of the mesh along with the necessary information.

The ECS is simply a program that manipulates the scene graph based on incoming request API calls. The actual scene graph data is stored in a specific location within the runtime instance as a pool that only the ECS system can access.

The ECS also manages the process of calling other sub-engine’s APIs to export the latest scene graph. For instance, the render engine has an API that can convert the scene graph into render states, based on different low-level render APIs, and store it into the render engine's data pool. Each time rendering occurs, the render engine first examines its own pool and renders the picture based on the provided information. The information that the render engine uses will be updated once the ECS's write function is activated. If we need to load a new mesh component within the scene graph state pool, this action can only be achieved by calling the ECS to load the mesh. By loading the mesh, the ECS writes different data into the pool, thereby triggering an update of the data in the render engine's pool.

To ensure that each sub-engine operates efficiently, any data structure related to a specific sub-engine that is stored in the pool is well-structured. This arrangement helps to avoid unnecessary data conversions during runtime.

```tsx
interface GameObject {
    id: number;
    components: Component[];
    // ...other properties
}

interface Component {
    // ...component properties
}

interface Mesh extends Component {
    // ...mesh specific properties
}

interface Texture extends Component {
    // ...texture specific properties
}

interface Transform extends Component {
    // ...transform specific properties
}

interface Collider extends Component {
    // ...collider specific properties
}

```

For any registered sub system to work synchronously, any sub system must provide an API called update for ECS to inform that sub system for any data change events. Here is the ECS system structure:

```tsx
class ECS {
    entities: GameObject[] = [];
    meshes: Map<number, Mesh> = new Map();
    textures: Map<number, Texture> = new Map();
    //...more component pools

    registerSystem(system) {
        this.systems.push(system);
    }

    unregisterSystem(system) {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
        }
    }

    updateSystems(entities) {
        for (let system of this.systems) {
            system.update(entities);
        }
    }

    createGameObject(components: Component[]): GameObject {
        const id = this.generateUniqueId();
        const gameObject = { id, components };
        this.gameObjectPool.push(gameObject);

        for (const component of components) {
            if (component instanceof MeshComponent) {
                this.meshComponentPool.set(id, component);
            } else if (component instanceof TextureComponent) {
                this.textureComponentPool.set(id, component);
            }
            // ... repeat for other component types ...
        }

        this.updateSystemPools(gameObject);

        return gameObject;
    }

    deleteGameObject(id: number) {
        this.gameObjectPool = this.gameObjectPool.filter(obj => obj.id !== id);
        this.meshComponentPool.delete(id);
        this.textureComponentPool.delete(id);
        // ... repeat for other component types ...

        this.updateSystemPools();
    }

    addComponent(gameObjectId: number, component: Component) {
        if (component instanceof MeshComponent) {
            this.meshComponentPool.set(gameObjectId, component);
        } else if (component instanceof TextureComponent) {
            this.textureComponentPool.set(gameObjectId, component);
        }
        // ... repeat for other component types ...

        this.updateSystemPools();
    }

    removeComponent(gameObjectId: number, componentType: Function) {
        if (componentType === MeshComponent) {
            this.meshComponentPool.delete(gameObjectId);
        } else if (componentType === TextureComponent) {
            this.textureComponentPool.delete(gameObjectId);
        }
        // ... repeat for other component types ...

        this.updateSystemPools();
    }

    private updateSystemPools(changedGameObject?: GameObject) {
        // Update the system pools based on the current state of the game objects and their components.
        // This would depend on the specific needs of your systems.
        // For example, you might need to rebuild the entire system pool, or you might be able to update
        // it incrementally based on the game object that was added, updated, or deleted.
    }

    private generateUniqueId(): number {
        // Generate a unique ID for a new game object.
        // This could be as simple as incrementing a counter, or more complex if needed.
    }

		loadScene(){}

		loadPrefab(){}

}
```

The Entity Component System (ECS) remains operational even in the absence of any active scenes in the runtime instance. The scene graph is merely another abstraction layered above the ECS, permitting the storage of multiple scene graph data while maintaining a singular location for runtime graph data. Notably, during runtime, only one scene can be active at any given time.

### **About state manager**:

An effective strategy for realizing game state behavior is to adopt certain interfaces provided by the state manager, such as lifecycle updates. These interfaces can then be implemented within our specific component system management logic, which awaits calls from the state manager.

As for interactions with other sub-engines, like the physics engine, state system operates reciprocally. For instance, whenever a physics event takes place, the manager’s **`onCollide`** API is activated, thus notifying all ECS component system management sections of this event, irrespective of whether the corresponding component entity is directly involved in the collision event.

In this way, the state manager can engage with other sub-engines, and they can interact with the state manager likewise.

### **Note:**

It's crucial to understand that the Entity Component System (ECS) and the State Manager are not standalone elements; instead, they collaborate to form the Runtime Manager. The ECS is responsible for managing game logic, while the State Manager oversees the overall game state and handles fundamental game events.