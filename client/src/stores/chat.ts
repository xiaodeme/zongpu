import { create } from 'zustand';

/**
 * 消息接口
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * 聊天状态接口
 */
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

/**
 * 聊天Store
 * 管理对话消息列表和加载状态
 */
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  
  /**
   * 添加新消息
   */
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  /**
   * 更新指定ID的消息内容
   */
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, content } : msg
    )
  })),
  
  /**
   * 设置加载状态
   */
  setLoading: (loading) => set({ isLoading: loading }),
  
  /**
   * 清空所有消息
   */
  clearMessages: () => set({ messages: [] })
}));