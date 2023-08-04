# Asset IO

External assets are processed through the Asset Input-Output (IO) Engine pipeline and transformed into one or more engine-compatible assets.

For instance, a glTF file can be converted into .texture, .animation, .skin, .mesh, and .material assets. If the glTF file includes embedded external files such as images, these images are treated as external assets and processed through the pipeline again.

After this conversion process, the original external asset remains unchanged in the folder. However, an additional .meta file is created, which contains corresponding engine-compatible asset data. This .meta file serves as the exclusive source for the engine to load assets into the runtime scene. Within the engine editor, the external asset is disregarded, and the .meta file is presented as an engine-recognized asset.

### About engine asset and its .meta file:

- .gltf .meta file will be represented as a thumbnail of the model and the actual node structure referring to different separated engine assets like .png .texture, .mesh. These second level engine assets parsed from the gltf will become individual at their own, each has its own corresponding .meta asset
- .png files are image files that are used as the source for textures. They contain the raw image data in a standard format that can be read by many different programs.
    
    The .png's .meta file contains the actual image data in a format that can be directly used by the GPU. This might be a compressed format to save memory, or it might be a raw format for maximum quality. The .meta file also contains metadata about the image, such as its dimensions and format (e.g., RGB, RGBA, etc.).
    
    ```json
    {
        "width": 1024,
        "height": 1024,
        "format": "RGBA",
        "imageData": "<binary data>"
    }
    ```
    
- .texture asset contains the configuration of the texture. This includes information such as the texture's dimensions, its format (e.g., RGB, RGBA, etc.), and any other settings that affect how the texture is used, such as its wrap mode (e.g., repeat, clamp to edge, etc.) and filter mode (e.g., linear, nearest, etc.).
    
    The .texture's .meta file does not contain the actual image data. Instead, it contains a reference to the .png's .meta file, which holds the actual image data. This allows the engine to separate the texture's configuration from its image data, providing more flexibility.
    
    ```json
    {
    		"width": 1024,
    		"height": 1024,
    		"format": "RGBA",
    		"wrapMode": "Repeat",
    		"filterMode": "Linear"
    }
    ```
    
    ```json
    {
        "originalFile": "Example.png.meta"
    }
    ```
    
- .mesh asset contains the configuration of the mesh. This includes information such as the vertex attributes (e.g., positions, normals, texture coordinates, etc.), the indices that define the triangles of the mesh, and any other settings that affect how the mesh is rendered.
    
    The .mesh's .meta file contains the actual vertex and index data in a format that can be directly used by the GPU. This allows the engine to efficiently load the mesh data directly into the GPU's memory, without having to parse the .mesh file. The .meta file also contains metadata about the mesh, such as the number of vertices and indices, and the format of the vertex attributes.
    
    ```json
    {
        "vertexAttributes": [
            {"name": "position", "type": "vec3"},
            {"name": "normal", "type": "vec3"},
            {"name": "texCoord", "type": "vec2"}
        ],
        "indices": "Example.indices"
    }
    
    ```
    
    ```json
    {
        "vertexCount": 1024,
        "indexCount": 2048,
        "vertexData": "<binary data>",
        "indexData": "<binary data>"
    }
    
    ```
    
- .animation asset contains the configuration of the animation. This includes information such as the duration of the animation, the frames per second (fps), and references to the animated properties (e.g., position, rotation, scale, etc.) of the objects.
    
    The .animation's .meta file contains the actual keyframe data in a format that can be directly used by the engine. This allows the engine to efficiently load the animation data and interpolate between keyframes during runtime. The .meta file also contains metadata about the animation, such as the number of keyframes, the timing of each keyframe, and the type of interpolation to be used (e.g., linear, bezier, etc.).
    
    ```json
    {
        "duration": 10.0,
        "fps": 30,
        "animatedProperties": [
            {"object": "Character", "property": "position"},
            {"object": "Character", "property": "rotation"}
        ]
    }
    
    ```
    
    ```json
    {
    		"keyframeCount": 300,
    		"keyframeData": "<binary data>"
    }
    ```
    
- .skin asset contains the information about the skinning of the model. This includes the joint hierarchy, the bind pose matrices for each joint, and the weights that determine how much each joint influences each vertex of the mesh.
    
    The .skin's .meta file contains the actual skinning data in a format that can be directly used by the engine. This allows the engine to efficiently load the skinning data and apply it to the mesh during runtime. The .meta file also contains metadata about the skinning, such as the number of joints, the hierarchy of the joints, and the format of the weights.
    
    ```json
    {
        "joints": [
            {"name": "Root", "parent": null},
            {"name": "Spine", "parent": "Root"},
            {"name": "Head", "parent": "Spine"},
            // More joints...
        ],
        "weights": "Example.weights"
    }
    
    ```
    
    ```json
    {
    		"jointCount": 50,
    		"hierarchy": "<binary data>",
    		"bindPoses": "<binary data>",
    		"weights": "<binary data>"
    }
    ```
    
- .material asset contains the information about the appearance of the model, including the color, texture, and other surface properties. Its .meta file contains references to the textures used (which point to the .meta files of the .png or .texture files), as well as any other parameters needed to render the material, such as the type of shading model used (e.g., Phong, Lambertian, etc.).
- .shader asset contains the shader program that is used to render the materials. This typically includes a vertex shader, which processes the vertices of the mesh, and a fragment shader, which processes the pixels of the rendered image. Depending on the complexity of the rendering pipeline, it might also include other types of shaders, such as geometry shaders, tessellation shaders, or compute shaders. The shader code is usually written in a shading language like GLSL or HLSL. The .shader's .meta file contains the compiled version of the shader code, which can be directly used by the GPU. This compilation process is usually done ahead of time to improve performance. The .meta file might also contain other information, such as the input and output variables of the shader, any constants or uniforms used, and the render states that should be set when using this shader.
    
    ```glsl
    #version 330 core
    layout (location = 0) in vec3 aPos;
    layout (location = 1) in vec3 aNormal;
    layout (location = 2) in vec2 aTexCoord;
    
    out vec2 TexCoord;
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;
    
    void main()
    {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
        TexCoord = aTexCoord;
    }
    
    // Fragment Shader
    #version 330 core
    out vec4 FragColor;
    
    in vec2 TexCoord;
    uniform sampler2D texture_diffuse1;
    
    void main()
    {
        FragColor = texture(texture_diffuse1, TexCoord);
    }
    ```
    
    ```json
    {
        "shaderType": "GLSL",
        "version": "330 core",
        "inputs": [
            {"name": "aPos", "type": "vec3", "location": 0},
            {"name": "aNormal", "type": "vec3", "location": 1},
            {"name": "aTexCoord", "type": "vec2", "location": 2}
        ],
        "outputs": [
            {"name": "FragColor", "type": "vec4"}
        ],
        "uniforms": [
            {"name": "model", "type": "mat4"},
            {"name": "view", "type": "mat4"},
            {"name": "projection", "type": "mat4"},
            {"name": "texture_diffuse1", "type": "sampler2D"}
        ],
        "compiledCode": "<binary data>"
    }
    ```
    

### **About the asset IO engine pipeline:**

The Asset IO Engine Pipeline is a fundamental component of a 3D engine. Its primary role is to transform external assets into a format that can be readily utilized by the engine. This transformation process involves parsing the original files, extracting necessary data, and subsequently storing this data in a new .meta file that the engine can interpret.

The pipeline operates as follows:

1. **Input**: The pipeline accepts an external asset file (such as a .gltf or .png file) as its input.
2. **Parsing**: The pipeline parses the input file and extracts the necessary data. For instance, parsing a .gltf file might involve extracting mesh data, texture references, animations, and skinning information. For a .png file, the pipeline would read the image data. Any external model file will eventually be converted to .prefab and .meta files.
3. **Prefab Creation**: The .prefab file provides comprehensive details of the original glTF file, but in the form of an engine scene graph. This supports engine-specific features such as scripting. The .prefab and .scene files essentially share the same underlying structure.
4. **Data Conversion**: The extracted data is then transformed into a format that is friendly to the engine. This could involve converting image data into a specific texture format or transforming mesh data into a format that can be easily used by the engine's renderer.
5. **Meta File Creation**: The converted data is subsequently stored in a new .meta file. This file contains all the information the engine requires to use the asset, in a format that it can easily read and interpret.
6. **Asset Loading**: The .meta file is then used by the engine to load the asset into the runtime scene. The engine disregards the original external asset file; all it requires is the .meta file.

This pipeline ensures that the engine can efficiently load and utilize assets, regardless of their original format. It also offers a high degree of flexibility, as the engine can support any asset format for which a parser can be written.

### glTF reminder:

Process GLTF resources into a unified engine input, converting mesh, material, animation, etc. into engine classes. Binary data doesn't need to be changed. At this stage, it should be implemented such that the engine classes can correctly access and parse binary block data. The entire engine uses the ECS (Entity Component System) model. All classes must have an index corresponding to the binary data, which is stored in a database. Only when the data exists in the database, can it be referenced by the corresponding class.

Example:

```json
{
    "primitives": [
        {
            "attributes": {
                "POSITION": 0,
                "NORMAL": 1,
                "TEXCOORD_0": 2,
                "TEXCOORD_1": 3,
                "TANGENT": 4,
                "COLOR_0": 5,
                "JOINTS_0": 6,
                "WEIGHTS_0": 7
            },
            "indices": 8,
            "material": 0,
            "mode": 4,
            "targets": [
                {
                    "POSITION": 9,
                    "NORMAL": 10,
                    "TANGENT": 11
                },
                {
                    "POSITION": 12,
                    "NORMAL": 13,
                    "TANGENT": 14
                }
            ]
        }
    ]
}
```

Here, each key corresponds to the accessor index. The final data for **`JOINTS_0`** and **`WEIGHTS_0`** is in matrix form. The lengths of these two arrays should be consistent. The information carried by the **`JOINTS_0`** matrix is the sequence number of the bone nodes affected by each primitive's vertex, which corresponds to the sequence number in the **`joints`** array of the glTF's skin.

Breaking it down: A **`primitive`** corresponds to a file, equivalent to a 'mesh' in Unity. Each accessor's index will turn into an ID. The primitive itself also needs to have an ID for querying the path of the skin file in the glTF file. The 'skin' corresponds to a file where the **`joints`** array in the skin is the sequence number of nodes in the glTF file. Therefore, the skin also needs an ID to query the corresponding glTF node graph. The 'mesh' corresponds to a file, which is a 'gameobject' in Unity. The mesh includes the ID of the primitive. This ID can query the corresponding mesh file path.