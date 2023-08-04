import React, { useCallback, useState } from "react";

const getFilesRecursively = async (
  entry: FileSystemDirectoryHandle | FileSystemFileHandle
): Promise<File[]> => {
  if (entry.kind === "file") {
    const file = await entry.getFile();
    if (file !== null) {
      return [file];
    }
    return [];
  } else if (entry.kind === "directory") {
    let files: File[] = [];
    for await (const handle of entry.values()) {
      files = files.concat(await getFilesRecursively(handle));
    }
    return files;
  }
  return [];
};

const LoadDirectory = () => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const onClick = useCallback(async () => {
    const fileSystemDirectoryHandle = await window.showDirectoryPicker();
    let fileNames: string[] = [];
    for await (const entry of fileSystemDirectoryHandle.values()) {
      fileNames = fileNames.concat(entry.name);
    }
    setFileNames(fileNames);
  }, []);
  return (
    <div>
      <button onClick={onClick} style={{ margin: "8px" }}>
        get all fileNames in Directory
      </button>
      <div>
        {fileNames.map((name) => {
          return <div key={name}>{name}</div>;
        })}
      </div>
    </div>
  );
};

export default LoadDirectory;
