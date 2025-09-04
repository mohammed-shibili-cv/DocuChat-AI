export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  base64Content: string;
}

export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  orderDate?: string;
  customer?: string;
  total?: number;
  items?: OrderItem[];
  receiptFileName?: string;
}