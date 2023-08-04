# Rendering

### **Key Concepts of Rendering:**

- Vertex Buffer and Index Buffer: These are specialized buffers used specifically for inputting vertex data.
- Bind Group: This is utilized to supply additional data to the rendering pipeline. It inputs data into the shader, apart from vertex data. This could include textures, samplers, transformation matrices, and other custom variables, among others.

### **Circumstances Permitting RenderPipeline Reuse:**

1. **Same Shaders**: The **`RenderPipeline`** can be reused if the vertex, fragment, and other shaders utilized within the pipeline are identical.
2. **Same Input State**: The **`RenderPipeline`** can be reused if the layout of the vertex buffers remains consistent. This includes the number of buffers, as well as the format and stride of each buffer (Multiple attributes can exist in one buffer or span across multiple buffers). This can be normalized during asset importing.
3. **Same Primitive Topology**: If the topology of the vertices remains the same (i.e., they form points, lines, or triangles), the **`RenderPipeline`** can be reused.
4. **Same Depth-Stencil and Blend State**: The **`RenderPipeline`** can be reused if the settings for depth and stencil testing, as well as blending functions, remain the same.
5. **Same Output Formats**: The **`RenderPipeline`** can be reused if the formats of the color and depth-stencil attachments (also known as "render targets") remain the same.
6. **Same Rasterization State**: The rasterization state encompasses parameters such as the cull mode (which determines whether back-facing or front-facing polygons are discarded), the front-face orientation (which establishes whether polygons are considered front-facing based on clockwise or counterclockwise vertex order), and the depth bias parameters (which help prevent z-fighting). The **`RenderPipeline`** can be reused if these parameters remain consistent.

Please note that reusing the **`RenderPipeline`** does not imply that every object drawn with that pipeline will have the same appearance. The appearance of objects can still be varied by using different bind groups to supply different resources (like textures and uniform values) to the shaders, and by drawing different vertex data. Moreover, the pipeline only defines the settings for depth and stencil testing, and blending; the actual depth, stencil, and color values come from the textures attached as render targets.

### **Steps to Render a Pass:**

1. **`setPipeline`**: This sets the active render pipeline.
2. **`setVertexBuffer`**: This sets the active vertex buffer.
3. **`setIndexBuffer`**: This sets the active index buffer.
4. **`setBindGroup`**: This function must be called to input all variables into the shader.
5. **`render`**: This initiates the rendering process.

Rendering a single frame may involve multiple passes, each responsible for different tasks. Some passes are assigned to render different pipelines (for example, solid models first, then semi-transparent models), while others are dedicated to post-processing tasks.

### **When to Utilize Instancing:**

1. **Same Geometry**: All instances must share the same geometry, meaning they use identical vertex and index data. This is a fundamental requirement of instanced rendering as it enables the GPU to reuse the same data for each instance.
2. **Same Render State**: All instances are drawn with the same render pipeline, which includes the shaders, vertex layout, and various render states like blending and depth testing. Although all instances should have the same overall render state, their appearances can vary as per-instance data can be used to modify properties like color, texture, or parts of the vertex data for each instance.
3. **Different Transformations or Other Per-Instance Data**: While all instances share the same geometry and render state, they typically have different transformations (position, rotation, scale), allowing them to appear at different locations and orientations. This per-instance data, such as transformations or other properties like color or texture coordinates, can be passed to the shaders in several ways, like through a vertex buffer with instanced data, or through a uniform buffer or texture accessed using the instance ID.

If these conditions are met, you can use the **`drawInstanced`** or **`drawIndexedInstanced`** methods in WebGPU to draw multiple instances with a single draw call. Each instance will be drawn using the same vertex and index data, but the shaders can access per-instance data to customize the appearance and transformation of each instance.

Because **`drawInstanced`** is a single function call, all the shader input information required for different instances needs to be passed in at once using **`setBindGroup`**. For instance, if there are 100 blocks each with its own transformation matrix, and you want to use **`drawInstanced`**, then the corresponding 100 transformation matrices need to be stored in a single **`bindGroup`**. Even if only one block's transformation matrix changes, the entire **`bindGroup`** needs to be updated.

### **Frame Rendering Optimization:**

The most time-consuming operation in each pass is **`setPipeline`**. Hence, the primary goal when rendering a frame is to minimize the number of **`setPipeline`** calls. Subsequently, the number of remaining operation calls should also be reduced to the lowest possible.

We have already discussed in which cases a pipeline can be reused. The most important point is that the reusability of a pipeline is not associated with specific vertexBuffer, indexBuffer, or bindGroup. This means that even if there are 100 models of different shapes, as long as their pipeline settings are identical, only one **`setPipeline`** call is needed.

Next, let's consider the order of calling vertex, index, and bindGroup. If the number of different data sets in the vertex data buffer is less than the number of different data sets in the shader variable buffer, the vertex buffer setting should be called first, and vice versa. For example, if there are three models with the same shape, but each model has different shader variables, then calling **`setBuffer`** once followed by **`setBindGroup`** three times will result in four calls in total. On the other hand, if you first call **`setBindGroup`** three times, each time will require a separate **`setBuffer`** call, resulting in six calls in total.

### **Renderer Function Plan:**

Each function will reset the pipeline, buffer, and bindgroup cache data, providing the most direct optimization data for the final render function, including the indicator of whether to **`setBuffer`** first or **`setBindGroup`** first.

We will incorporate a function to transform the game state data retrieved from the ECS system into a format suitable render state for our rendering engine.

```tsx
/*
addPrimitive procedure:
1. Update vertexBuffer cache: Check the accessor reference address of the primitive, add to the vertexBuffer cache or bind the primitive's reference.
2. Update indexBuffer cache: Check the indices reference address of the primitive, add to the indexBuffer cache or bind the primitive's reference.
3. Update pipeline cache: Check the pipeline parameters required by the primitive, add to the pipeline cache or bind the primitive's reference.
4. Update bindGroup and bindGroupLayout cache: Use the SpirV Cross library to perform reflection on the shader code of the primitive, get input and output information, and create bindGroup and bindGroupLayout for each input. 
   Note: 
   It's important to determine whether the primitive needs instance rendering. The method to determine the rendering has been mentioned above. 
   If instance rendering is needed, then check whether there is a batch of bindGroup data in the cache for instance rendering. If not, create a new one. 
   If yes, expand it, and all bindGroups related to the instance rendering of the primitive should be deleted.
*/

function addPrimitive(primitive) {
    // Placeholder for your implementation
    // 1. Update vertexBuffer cache
    // ...

    // 2. Update indexBuffer cache
    // ...

    // 3. Update pipeline cache
    // ...

    // 4. Update bindGroup and bindGroupLayout cache
    // ...
}

/*
convertGameStateToRenderState procedure:
1. Get the game state, which contains information about all the entities and their current states.
2. Iterate over the entities and transform their game state into a format that can be used for rendering.
3. Update the render state based on the transformed data.
4. This converted render state can then be used in the rendering pipeline.
*/

function convertGameStateToRenderState(gameState) {
    // Placeholder for your implementation
    // 1. Get game state
    // ...

    // 2. Iterate over entities and transform game state to render state
    // ...

    // 3. Update the render state based on transformed data
    // ...

    // Return the updated render state
    // return renderState;
}
```

### **Rendering a Frame Process:**

1. Retrieve all pipeline data.
2. For each pipeline, enter the loop:
    1. Determine which collection, buffer or bindGroup, under this pipeline has more quantity, then set that one first.

```json
"rendererState": {
  "pipeline": [
    {
      "pipelineID": "UniqueIDForThePipeline",
      "shaders": {
        "vertexShader": "VertexShaderCode",
        "fragmentShader": "FragmentShaderCode",
        // more shaders if applicable
      },
      "bindGroup": [
        {
          "bindGroupID": "UniqueIDForTheBindGroup",
          "resources": [
            {
              "resourceID": "UniqueIDForResource",
              "resourceType": "Texture|Buffer|Sampler",
              "resourceDetails": { /* specific details depending on the resource type */ }
            },
            // more resources
          ]
        },
        // more bind groups
      ],
      "vertexBuffer": [
        {
          "bufferID": "UniqueIDForTheVertexBuffer",
          "bufferLayout": { /* details about the buffer layout */ },
          "bufferData": { /* actual vertex data */ }
        },
        // more vertex buffers
      ],
      "indexBuffer": [
        {
          "bufferID": "UniqueIDForTheIndexBuffer",
          "bufferData": { /* actual index data */ }
        }
        // more index buffers
      ]
    }
    // more pipelines
  ]
}
```

### **Note:**

1. The original game state is stored in runtime engine state manager,
2. After model import, the vertex attribute buffer data should not be merged. The reason being, if some shaders do not use certain attributes, graphics memory will be wasted. During rendering, we only load buffers of the vertex attributes used by the shader.