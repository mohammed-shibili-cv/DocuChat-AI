import React from 'react';
import { UploadedFile } from '../types';
import { FileIcon } from './icons/FileIcon';
import { PDFIcon } from './icons/PDFIcon';
import { TrashIcon } from './icons/TrashIcon';

interface DocumentListProps {
  files: UploadedFile[];
  onDelete: (fileId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ files, onDelete }) => {
  if (files.length === 0) {
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex-grow">
            <h2 className="text-lg font-semibold text-white mb-4">Knowledge Base</h2>
            <div className="text-center text-slate-400 py-8">
                <p>Your knowledge base is empty.</p>
                <p className="text-sm text-slate-500">Upload documents to get started.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex-grow">
      <h2 className="text-lg font-semibold text-white mb-4">Knowledge Base</h2>
      <ul className="space-y-2">
        {files.map(file => (
          <li key={file.id}>
            <div
              className={`w-full flex items-center p-3 rounded-md text-left bg-slate-700/50 text-slate-300 group`}
            >
              {file.type === 'application/pdf' ? <PDFIcon className="w-5 h-5 mr-3 flex-shrink-0 text-red-400"/> : <FileIcon className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400"/>}
              <span className="truncate flex-grow">{file.name}</span>
              <button
                onClick={() => onDelete(file.id)}
                className="ml-2 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${file.name}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;