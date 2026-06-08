export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  status: 'sent' | 'loading' | 'error' | 'success';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface SystemStats {
  totalChats: number;
  apiCalls: number;
  successRate: number;
}
