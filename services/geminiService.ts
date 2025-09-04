
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export const queryDocuments = async (prompt: string, files: UploadedFile[]): Promise<string> => {
  try {
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.base64Content,
      },
    }));

    const textPart = {
      text: `Based on the provided documents (invoices, receipts, etc.), answer the following question. Synthesize information across documents if necessary. Question: "${prompt}"`,
    };

    const allParts = [...fileParts, textPart];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: allParts },
      config: {
        systemInstruction: "You are an expert financial assistant. Your knowledge base consists of the documents provided by the user. Analyze and extract data from these documents to answer questions. If the answer isn't in the documents, say so. Respond clearly and accurately based only on the provided documents.",
      }
    });
    
    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `Error processing documents: ${error.message}`;
    }
    return "An unexpected error occurred while processing the documents.";
  }
};
