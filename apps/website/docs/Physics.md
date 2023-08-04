# Physics

### **Overview**

A physics engine is an essential component of a modern game engine, allowing for the simulation of physical systems in the game world. It calculates the changes in an object's position, rotation, and other physical attributes over time based on applied forces, friction, and other physical phenomena.

### **Key Features**

1. **Collision Detection**: Collision detection is the process of detecting when two or more objects have come into contact. The physics engine uses various algorithms to efficiently detect collisions in large game worlds filled with numerous entities.
2. **Rigid Body Dynamics**: This simulates the motion and rotation of solid objects (as opposed to fluid or soft, deformable bodies). The physics engine will apply Newton's laws of motion to calculate the new position and rotation of these objects.
3. **Soft Body Dynamics**: Unlike rigid body dynamics, soft body dynamics caters to objects that can deform and change shape. This could apply to numerous things like cloth, jelly, or even soft body characters.
4. **Vehicle Physics**: Many games involve the simulation of vehicles. The physics engine may include special features to simulate the complex interactions between the vehicle's wheels and the ground, as well as aerodynamics and engine mechanics.
5. **Ragdoll Physics**: This simulates the movement of a character's body upon death, taking into account gravity and joint constraints.

### **Basic Usage**

The physics engine generally operates by first taking the objects in the runtime state ECS system and their initial states (positions, rotations, velocities, etc.) as input. Next, it calculates the forces acting on each object, such as gravity, friction, or custom forces defined by game logic. The engine then uses these forces to compute how each object's state should change over time.

The updated states are passed back to the ECS system, which uses them to render the objects at their new positions and rotations. This process is repeated many times per second to create the illusion of continuous movement.

### **About GPU physics:**

A GPU-accelerated physics engine utilizes the immense parallel processing power of modern GPUs to perform physics calculations. This can result in a significant performance boost, particularly for games with complex physics simulations involving large numbers of objects.

The data flow from a GPU-accelerated physics engine to the game engine involves a few steps:

1. **Simulation Setup**: The physics engine first sets up the physical world on the CPU side. This involves defining the physical properties of the objects (like mass, shape, and initial velocity) and the forces at play (like gravity and wind). The data is then passed to the GPU.
2. **Running the Simulation**: The physics calculations are performed on the GPU. The GPU can handle many calculations simultaneously, making it perfect for physics simulations where the forces on many objects need to be calculated independently.
3. **Reading the Results**: Once the GPU has calculated the new states of the objects, this data is read back into system memory. This is often a bottleneck in the process due to the relatively slow speed of transferring data from the GPU to the CPU.
4. **Update Game State**: The game engine takes the updated physics data and applies it to the game objects, updating their positions, rotations, and other properties in the game world.

In some architectures, steps 3 and 4 could be combined by using shared memory between the CPU and GPU or other advanced techniques to minimize data transfer.

Remember, using a GPU for physics calculations only makes sense if the physics calculations are complex and numerous enough to outweigh the overhead of transferring data between CPU and GPU. If the physics simulation is simple or if there are few objects, it might be faster to perform the calculations directly on the CPU.

Overall, GPU-based physics can lead to more realistic and immersive games by allowing for more detailed physics simulations. However, it also introduces additional complexity into the game development process and requires careful management of the data flow between the CPU and GPU.