
import React, { useState, useCallback } from 'react';
import { UploadedFile, ChatMessage, MessageAuthor } from './types';
import { queryDocuments } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatWindow from './components/ChatWindow';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: UploadedFile) => {
    const isFirstUpload = uploadedFiles.length === 0;
    setUploadedFiles(prevFiles => [...prevFiles, file]);
    
    const uploadMessage: ChatMessage = {
      author: MessageAuthor.AI,
      text: `I've added **${file.name}** to my knowledge base.`,
    };

    if (isFirstUpload) {
      setChatHistory([
        uploadMessage,
        {
          author: MessageAuthor.AI,
          text: `How can I help you with your documents?`,
        }
      ]);
    } else {
      setChatHistory(prev => [...prev, uploadMessage]);
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one document before sending a message.');
      return;
    }

    const newUserMessage: ChatMessage = { author: MessageAuthor.USER, text: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await queryDocuments(message, uploadedFiles);
      const newAiMessage: ChatMessage = { author: MessageAuthor.AI, text: aiResponse };
      setChatHistory(prev => [...prev, newAiMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't process that request. ${errorMessage}`);
      const errorAiMessage: ChatMessage = { author: MessageAuthor.AI, text: `Sorry, I ran into an error trying to answer that. Please try again. \n\n**Error:** ${errorMessage}` };
      setChatHistory(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-sky-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">DocuChat AI</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
          <FileUpload onFileUpload={handleFileUpload} />
          <DocumentList
            files={uploadedFiles}
          />
        </aside>

        {/* Right Chat Area */}
        <section className="flex-grow flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-2xl">
          <ChatWindow
            chatHistory={chatHistory}
            isLoading={isLoading}
            error={error}
            hasDocuments={uploadedFiles.length > 0}
            onSendMessage={handleSendMessage}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
