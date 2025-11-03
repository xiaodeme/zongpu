import { useState, useRef, useEffect } from 'react';
import { useChatStore, Message } from '../stores/chat';
import { sendQueryStream } from '../api/lightrag';
import { toast } from 'sonner';
import { generateId, formatTime } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SendIcon, TrashIcon, ArrowLeftRightIcon } from 'lucide-react';
import MessageBubble from '../components/ui/MessageBubble';

/**
 * 聊天页面组件
 * 主要的对话界面，支持发送消息和接收流式响应
 */
const ChatPage = () => {
  const { messages, isLoading, addMessage, updateMessage, setLoading, clearMessages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 处理发送消息
   */
  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;
    
    // 验证输入长度，后端要求至少3个字符
    if (trimmedInput.length < 3) {
      toast.error('请输入至少3个字符的查询内容');
      return;
    }

    // 添加用户消息到列表
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    
    // 清空输入框
    setInputValue('');
    
    // 创建助手消息，初始为空，后续通过流式更新
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(assistantMessage);
    
    setLoading(true);
    
    // 调用流式查询API
    // 使用闭包保存完整的助手回复内容
    let assistantContent = '';
    await sendQueryStream(
      trimmedInput,
      // 接收到数据块时的回调 - 累加内容
      (chunk) => {
        assistantContent += chunk;
        updateMessage(assistantMessageId, assistantContent);
      },
      // 完成时的回调
      () => setLoading(false),
      // 错误时的回调
      (error) => {
        toast.error(error?.message || '发送失败，请重试');
        setLoading(false);
        updateMessage(assistantMessageId, `抱歉，处理请求时发生错误：${error?.message || '未知错误'}`);
      }
    );
  };

  /**
   * 处理键盘按键
   * Enter键发送消息，Shift+Enter换行
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * 处理清空对话
   */
  const handleClear = () => {
    clearMessages();
    toast.info('对话记录已清空');
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 h-screen w-screen overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">宗谱对话系统</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 p-3 flex flex-col overflow-hidden pb-20">
        {messages.length === 0 ? (
          // 空状态：显示欢迎信息
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <ArrowLeftRightIcon className="w-10 h-10 text-gray-400 mb-3" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">开始对话</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm">
              请在下方输入框中输入您的问题，系统会为您提供相关答案。
            </p>
          </div>
        ) : (
          // 消息列表 - 精确计算高度，确保在移动设备上不出现外部滚动条
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                time={formatTime(message.timestamp)}
              />
            ))}
            {/* 加载中状态指示器 */}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-2 max-w-[80%] animate-pulse">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 输入区域 - 确保固定在底部且在第一屏可见 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 border border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 mx-3 z-10">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? '正在回复中...' : '请输入您的问题...'}
            disabled={isLoading}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 py-3"
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
    </div>
  );
};

export default ChatPage;