
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
