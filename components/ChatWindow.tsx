
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import Message from './Message';
import { SendIcon } from './icons/SendIcon';
import { DocumentIcon } from './icons/DocumentIcon';

interface ChatWindowProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  hasDocuments: boolean;
  onSendMessage: (message: string) => void;
}

const WelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <DocumentIcon className="w-20 h-20 text-slate-600 mb-6"/>
    <h2 className="text-2xl font-bold text-white mb-2">Build Your Knowledge Base</h2>
    <p className="text-slate-400 max-w-md">
      Upload your invoices, receipts, and other documents to get started. The AI will learn from every document you add.
    </p>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ chatHistory, isLoading, hasDocuments, onSendMessage }) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendMessage(userInput.trim());
      setUserInput('');
    }
  };

  if (!hasDocuments) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">
          Chat with your Documents
        </h3>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <Message key={index} author={msg.author} text={msg.text} />
          ))}
          {isLoading && (
            <Message author={MessageAuthor.AI} text="" isLoading={true} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-grow bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
            disabled={isLoading || !hasDocuments}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !hasDocuments}
            className="bg-sky-600 text-white rounded-lg p-2.5 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
