'use client';

import { useState, ChangeEvent, DragEvent } from 'react';

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectedFiles = input.files;

    if (selectedFiles) {
      setFiles([...files, ...Array.from(selectedFiles)]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    setFiles([...files, ...Array.from(droppedFiles)]);
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer bg-gray-100"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <label htmlFor="fileInput" className="block text-gray-700 text-sm mb-2">
        Upload Documents
      </label>
      <input
        type="file"
        id="fileInput"
        name="files"
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
      <p className="text-gray-500">Drag and drop files here, or click to select files</p>
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
              <span className="text-gray-700">{file.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
