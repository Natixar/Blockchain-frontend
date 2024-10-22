'use client';

import FileUpload from '@/app/components/FileUpload';

interface Step3Props {
  onUpload: (files: File[]) => void;
}

export default function Step3DocumentUpload({ onUpload }: Step3Props) {
  const handleFileUpload = (files: File[]) => {
    onUpload(files);
  };

  return (
    <div className="w-full mx-auto mb-6">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">
        Upload Documents</h1>
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
}
