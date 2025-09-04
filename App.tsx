import React, { useState, useCallback, useEffect } from 'react';
import { UploadedFile, ChatMessage, MessageAuthor } from './types';
import { queryDocuments } from './services/geminiService';
import { dbService } from './services/databaseService';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatWindow from './components/ChatWindow';
import OrderAutofill from './components/OrderAutofill';
import { LogoIcon } from './components/icons/LogoIcon';
import { ChatIcon } from './components/icons/ChatIcon';
import { ScannerIcon } from './components/icons/ScannerIcon';

type View = 'chat' | 'order';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<View>('chat');

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await dbService.init();
        const docs = await dbService.getDocuments();
        setUploadedFiles(docs);
        if (docs.length > 0) {
           setChatHistory([{ author: MessageAuthor.AI, text: "Welcome back! I've loaded your documents. How can I assist you today?" }]);
        }
      } catch (e) {
        console.error(e);
        setError("Could not load the local database.");
      } finally {
        setIsDbLoading(false);
      }
    };
    initializeDb();
  }, []);

  const handleFileUpload = async (file: UploadedFile) => {
    await dbService.addDocument(file);
    const updatedFiles = await dbService.getDocuments();
    setUploadedFiles(updatedFiles);
    
    const uploadMessage: ChatMessage = {
      author: MessageAuthor.AI,
      text: `I've added **${file.name}** to my knowledge base.`,
    };

    if (chatHistory.length === 0) {
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

  const handleDeleteDocument = async (fileId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this document from your knowledge base?')) {
      await dbService.deleteDocument(fileId);
      const updatedFiles = await dbService.getDocuments();
      setUploadedFiles(updatedFiles);
       setChatHistory(prev => [...prev, { author: MessageAuthor.AI, text: "I've removed the document from the knowledge base." }]);
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

  const NavButton: React.FC<{view: View, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeView === view
          ? 'bg-sky-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">DocuChat AI</h1>
          </div>
          <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
            <NavButton view="chat" label="DocuChat" icon={<ChatIcon className="w-5 h-5"/>} />
            <NavButton view="order" label="Receipt Scanner" icon={<ScannerIcon className="w-5 h-5"/>} />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {isDbLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading Knowledge Base...</p>
          </div>
        ) : activeView === 'chat' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
              <FileUpload onFileUpload={handleFileUpload} />
              <DocumentList
                files={uploadedFiles}
                onDelete={handleDeleteDocument}
              />
            </aside>
            <section className="flex-grow flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-2xl">
              <ChatWindow
                chatHistory={chatHistory}
                isLoading={isLoading}
                error={error}
                hasDocuments={uploadedFiles.length > 0}
                onSendMessage={handleSendMessage}
              />
            </section>
          </div>
        ) : (
          <OrderAutofill onReceiptSave={handleFileUpload} />
        )}
      </main>
    </div>
  );
};

export default App;