
import React from 'react';
import { MessageAuthor } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AILogoIcon } from './icons/AILogoIcon';

interface MessageProps {
  author: MessageAuthor;
  text: string;
  isLoading?: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
    </div>
);

// Simple markdown-to-HTML converter
const formatText = (text: string) => {
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const newlines = bolded.replace(/\n/g, '<br />');
    return newlines;
};

const Message: React.FC<MessageProps> = ({ author, text, isLoading = false }) => {
  const isAI = author === MessageAuthor.AI;

  return (
    <div className={`flex items-start gap-4 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <AILogoIcon className="w-5 h-5 text-sky-400" />
        </div>
      )}
      
      <div className={`max-w-xl p-4 rounded-lg shadow ${
          isAI
            ? 'bg-slate-700 text-slate-200 rounded-tl-none'
            : 'bg-sky-600 text-white rounded-br-none'
        }`}
      >
        {isLoading ? <LoadingIndicator /> : (
            <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: formatText(text) }} />
        )}
      </div>
      
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};

export default Message;
