/**
 * The `components/FileUpload` module exports the `FileUpload` component, which provides
 * a user-friendly interface for uploading files through drag-and-drop or a file dialog.
 * 
 * This component is designed to be easily integrated into React applications, allowing users
 * to select multiple files and view the list of selected files with details such as name, type,
 * and size.
 * 
 * The component notifies the parent component of file uploads through a callback function,
 * enabling further processing of the uploaded files.
 *  
 * @see {@link https://reactjs.org/docs/handling-events.html} for more information on React event handling.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File} for the File API documentation.
 */

'use client';

import { ChangeEvent, DragEvent, useState } from 'react';

/**
 * Props for the FileUpload component.
 *
 * @property {(files: File[]) => void} onFileUpload - Callback function called when files are uploaded.
 */
export interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

/**
 * FileUpload component allows users to upload files by either dragging and dropping them
 * into a designated area or by clicking to open the file selection dialog.
 * 
 * This component manages the uploaded files using React's state management and notifies the
 * parent component of any file uploads via a callback function.
 * 
 * @remarks
 * The component supports multiple file uploads and displays a list of uploaded files
 * with their respective names, types, and sizes.
 * 
 * @example
 * Here's an example of how to use the FileUpload component:
 * 
 * ```tsx
 * function App() {
 *   const handleFileUpload = (files: File[]) => {
 *     console.log(files);
 *   };
 * 
 *   return <FileUpload onFileUpload={handleFileUpload} />;
 * }
 * ```
 * 
 * @param {FileUploadProps} props - The properties object for the component.
 * @returns {JSX.Element} The rendered FileUpload component.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File} for more information on the File API.
 */
export default function FileUpload({ onFileUpload }: FileUploadProps) {
  // State to store the list of uploaded files
  const [files, setFiles] = useState<File[]>([]);

  /**
   * Prevents the default behavior when a file is dragged over the drop area.
   *
   * @param {DragEvent<HTMLDivElement>} e - The drag event.
   */
  function handleDragOver(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  /**
   * Handles the drop event, updating the state with the new files and
   * calling the `onFileUpload` callback with the uploaded files.
   *
   * @param {DragEvent<HTMLDivElement>} e - The drop event.
   */
  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onFileUpload([...files, ...newFiles]);
  }

  /**
   * Handles the change event when files are selected using the file input,
   * updating the state and invoking the `onFileUpload` callback.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onFileUpload([...files, ...newFiles]);
  }

  /**
   * Simulates a click on the hidden file input to open the file selection dialog.
   */
  function handleClick(): void {
    const input = document.getElementById('documents') as HTMLInputElement;
    input.click();
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer bg-gray-100"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <label htmlFor="documents" className="block text-gray-700 text-sm mb-2">
        Upload Documents
      </label>
      <input
        type="file"
        id="documents"
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
              {/* <span className="text-gray-500">{file.type}</span>
              <span className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</span> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
