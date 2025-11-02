import React from 'react';
import { Message } from '../../stores/chat';
import { UserIcon, BotIcon } from 'lucide-react';

/**
 * 消息气泡组件属性
 */
interface MessageBubbleProps {
  message: Message;
  time: string;
}

/**
 * 消息气泡组件
 * 显示用户或助手的消息，包含头像和时间戳
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, time }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-2 space-r-2`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <BotIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`
          rounded-2xl 
          p-3 
          text-sm 
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
          }
        `}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {time}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;