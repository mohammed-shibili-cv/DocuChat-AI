import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UploadedFile, Order } from '../types';

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

export const extractOrderDetails = async (file: UploadedFile): Promise<Partial<Order>> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: file.base64Content,
      },
    };
    const textPart = {
      text: "Extract the key details from this receipt and return them as a JSON object. The fields should include order number, date, customer name, a list of items with their quantity and price, and the final total.",
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    orderNumber: { type: Type.STRING, description: "The order or invoice number, like 'OR-000034'." },
                    date: { type: Type.STRING, description: "The date of the order, like 'September 4th, 2025'." },
                    customer: { type: Type.STRING, description: "The name of the customer." },
                    total: { type: Type.NUMBER, description: "The final total amount due." },
                    items: {
                        type: Type.ARRAY,
                        description: "List of items in the order.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of the item, e.g., 'Shirt'." },
                                quantity: { type: Type.NUMBER, description: "Quantity of the item." },
                                price: { type: Type.NUMBER, description: "Total price for this line item." }
                            },
                        }
                    }
                }
            }
        }
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    // Map the API response to our Order type
    return {
        orderNumber: parsed.orderNumber,
        orderDate: parsed.date,
        customer: parsed.customer,
        total: parsed.total,
        items: parsed.items,
    };

  } catch (error) {
    console.error("Gemini info extraction failed:", error);
    if (error instanceof Error) {
        throw new Error(`Error extracting details: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while extracting receipt details.");
  }
};