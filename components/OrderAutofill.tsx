import React, { useState } from 'react';
import { UploadedFile, Order, OrderItem } from '../types';
import FileUpload from './FileUpload';
import { extractOrderDetails } from '../services/geminiService';
import { dbService } from '../services/databaseService';
import { ScannerIcon } from './icons/ScannerIcon';

interface OrderAutofillProps {
  onReceiptSave: (file: UploadedFile) => void;
}

const OrderAutofill: React.FC<OrderAutofillProps> = ({ onReceiptSave }) => {
  const [receiptFile, setReceiptFile] = useState<UploadedFile | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Order>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = async (file: UploadedFile) => {
    setReceiptFile(file);
    setIsLoading(true);
    setError(null);
    setIsSaved(false);
    setExtractedData({});

    try {
      const data = await extractOrderDetails(file);
      setExtractedData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormChange = (field: keyof Order, value: any) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...(extractedData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleFormChange('items', updatedItems);
  };

  const handleSaveOrder = async () => {
    if (!receiptFile) return;

    try {
      const orderToSave: Order = {
        id: `order-${Date.now()}`,
        ...extractedData,
        receiptFileName: receiptFile.name,
      };

      await dbService.addOrder(orderToSave);
      // Also add the receipt image to the general knowledge base
      onReceiptSave(receiptFile);
      setIsSaved(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? `Failed to save order: ${e.message}`: 'An unknown saving error occurred.');
    }
  };

  const FormField: React.FC<{label: string, value: string | number | undefined, onChange: (val: any) => void, type?: string, placeholder?: string}> = 
    ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Upload & Preview */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-white">Upload Receipt</h2>
        <FileUpload onFileUpload={handleFileUpload} />
        {receiptFile && (
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Preview</h3>
            <img 
              src={`data:${receiptFile.type};base64,${receiptFile.base64Content}`} 
              alt="Receipt preview"
              className="rounded-lg max-h-96 w-full object-contain bg-slate-700"
            />
          </div>
        )}
      </div>

      {/* Right Column: Extracted Data Form */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Extracted Order Details</h2>
        {!receiptFile ? (
           <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <ScannerIcon className="w-16 h-16 text-slate-600 mb-4"/>
             <p>Upload a receipt to begin extraction.</p>
           </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
             <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p>Analyzing receipt... this may take a moment.</p>
           </div>
        ) : error ? (
           <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
             <p><strong>Extraction Failed</strong></p>
             <p className="text-sm">{error}</p>
           </div>
        ) : (
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Order #" value={extractedData.orderNumber} onChange={val => handleFormChange('orderNumber', val)} placeholder="e.g., OR-000034"/>
               <FormField label="Date" value={extractedData.orderDate} onChange={val => handleFormChange('orderDate', val)} placeholder="e.g., September 4th, 2025"/>
            </div>
            <FormField label="Customer" value={extractedData.customer} onChange={val => handleFormChange('customer', val)} placeholder="e.g., John Doe"/>
            <div>
                <h3 className="text-md font-medium text-slate-300 mb-2">Items</h3>
                <div className="space-y-2">
                    {(extractedData.items || []).map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 p-2 bg-slate-700/50 rounded-md">
                           <input type="text" value={item.name || ''} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Item Name" className="col-span-2 bg-slate-600 text-slate-200 rounded px-2 py-1 border-slate-500 border"/>
                           <div className="flex gap-2">
                            <input type="number" value={item.quantity || ''} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} placeholder="Qty" className="w-full bg-slate-600 text-slate-200 rounded px-2 py-1 border-slate-500 border"/>
                            <input type="number" value={item.price || ''} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} placeholder="Price" className="w-full bg-slate-600 text-slate-200 rounded px-2 py-1 border-slate-500 border"/>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pt-2">
               <FormField label="Total Amount" type="number" value={extractedData.total} onChange={val => handleFormChange('total', val)} placeholder="e.g., 10.00"/>
            </div>
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSaveOrder}
                    disabled={isSaved}
                    className="bg-sky-600 text-white font-semibold rounded-lg px-5 py-2.5 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                    {isSaved ? 'Saved!' : 'Save Order'}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderAutofill;
