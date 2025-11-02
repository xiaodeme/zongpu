import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/state';
import { useChatStore, Message } from '../stores/chat';
import { mockSendQuery } from '../api/lightrag';
import { toast } from 'sonner';
import { generateId, formatTime } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SendIcon, LogOutIcon, TrashIcon, ArrowLeftRightIcon } from 'lucide-react';
import MessageBubble from '../components/ui/MessageBubble';

const ChatPage = () => {
  const { logout } = useAuthStore();
  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    
    // 清空输入框
    setInputValue('');
    
    try {
      setLoading(true);
      // 调用API获取回复
      const response = await mockSendQuery(trimmedInput);
      
      // 添加助手消息
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);
    } catch (error: any) {
      toast.error(error?.message || '发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('已成功退出登录');
  };

  const handleClear = () => {
    clearMessages();
    toast.info('对话记录已清空');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 md:px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">宗谱对话系统</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              清空
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <LogOutIcon className="w-4 h-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ArrowLeftRightIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">开始对话</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              请在下方输入框中输入您的问题，系统会为您提供相关答案。
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                time={formatTime(message.timestamp)}
              />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 max-w-[80%] animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* 输入区域 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? '正在回复中...' : '请输入您的问题...'}
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
              autoComplete="off"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;