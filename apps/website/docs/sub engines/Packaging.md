# Packaging

The export packaging engine plays a crucial role in the game development pipeline, allowing developers to package and distribute game assets efficiently. The engine operates by converting complex resource files, such as glTFs, into a format that's easier for the game engine to process and render.

### Converting GLTF Resources

The first step in the export packaging process involves converting GLTF resources into a unified input format that the engine can easily process. This involves transforming data related to meshes, materials, animations, and other game assets into corresponding engine classes.

### Binary Data

Binary data is especially important, as it provides a compact, efficient format for storing complex 3D models and animations. During this stage of the process, the engine ensures the binary data can be correctly accessed and parsed, allowing for seamless integration into the game.

### Entity Component System (ECS)

The export packaging engine leverages the Entity Component System (ECS) model for handling game objects. Each class within the ECS model has a corresponding binary data index, which is stored in a database. This index allows for efficient referencing and retrieval of game objects.

### Packaging Process

Each game asset, including primitives, skins, and meshes, is assigned a unique ID during the packaging process. These IDs enable efficient querying of the game asset files. For instance, a primitive's ID can be used to query the path of the skin file in the GLTF file.

### Final Output

The final output of the export packaging engine is a collection of game asset files, each of which can be efficiently loaded and rendered by the game engine. This streamlines the game development process and allows for a more efficient use of system resources, leading to better game performance and a more enjoyable player experience.