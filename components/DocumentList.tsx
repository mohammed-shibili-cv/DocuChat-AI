
import React from 'react';
import { UploadedFile } from '../types';
import { FileIcon } from './icons/FileIcon';
import { PDFIcon } from './icons/PDFIcon';

interface DocumentListProps {
  files: UploadedFile[];
}

const DocumentList: React.FC<DocumentListProps> = ({ files }) => {
  if (files.length === 0) {
    return null; // Don't render anything if there are no files
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex-grow">
      <h2 className="text-lg font-semibold text-white mb-4">Knowledge Base</h2>
      <ul className="space-y-2">
        {files.map(file => (
          <li key={file.id}>
            <div
              className={`w-full flex items-center p-3 rounded-md text-left bg-slate-700/50 text-slate-300`}
            >
              {file.type === 'application/pdf' ? <PDFIcon className="w-5 h-5 mr-3 flex-shrink-0 text-red-400"/> : <FileIcon className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400"/>}
              <span className="truncate flex-grow">{file.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
