
import React, { useState, useCallback } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove the "data:mime/type;base64," prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are accepted.');
      return;
    }
    try {
      const base64Content = await fileToBase64(file);
      const newFile: UploadedFile = {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        type: file.type,
        base64Content: base64Content,
      };
      onFileUpload(newFile);
    } catch (error) {
      console.error("Error converting file to base64", error);
      alert("There was an error processing your file.");
    }
  }, [onFileUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Upload Document</h2>
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-800 border-2 border-slate-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-sky-500 focus:outline-none ${isDragging ? 'border-sky-500 bg-slate-700' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className="flex items-center space-x-2">
          <UploadIcon className="w-6 h-6 text-slate-400"/>
          <span className="font-medium text-slate-400">
            Drop file or <span className="text-sky-400">browse</span>
          </span>
        </span>
        <span className="mt-1 text-xs text-slate-500">Supports: PNG, JPG, PDF</span>
        <input id="file-upload" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange} />
      </label>
    </div>
  );
};

export default FileUpload;
