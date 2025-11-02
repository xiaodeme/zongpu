import { AxiosError } from 'axios';

/**
 * 格式化错误消息
 */
export const errorMessage = (error: any): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.data?.message) {
        return error.response.data.message;
      }
      return `服务器错误: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      return '网络错误，请检查您的连接';
    }
  }
  // 其他错误
  return error?.message || String(error) || '未知错误';
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 格式化时间
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};