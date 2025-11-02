import axios from 'axios';
import { backendBaseUrl, defaultTimeout } from '@/lib/constants';
import { useAuthStore } from '@/stores/state';

// 创建axios实例
const api = axios.create({
  baseURL: backendBaseUrl,
  timeout: defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除认证状态并重定向到登录页
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const loginToServer = async (username: string, password: string) => {
  const response = await api.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const getAuthStatus = async () => {
  const response = await api.get('/auth/status');
  return response.data;
};

// 对话相关API
export const sendQuery = async (queryText: string, mode: string = 'local') => {
  const response = await api.post('/query', {
    query_text: queryText,
    mode,
  });
  return response.data;
};

// 为了模拟环境，提供模拟的API实现
export const mockLoginToServer = async (username: string, password: string) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 简化的验证逻辑：任何用户名，密码必须为123456
  if (password !== '123456') {
    throw new Error('密码错误，默认密码为123456');
  }
  
  return {
    access_token: 'mock_token_' + Date.now(),
    user_info: {
      username,
    },
    core_version: '1.0.0',
    api_version: '1.0.0',
  };
};

export const mockGetAuthStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    auth_configured: true,
    access_token: null,
    core_version: '1.0.0',
    api_version: '1.0.0',
  };
};

export const mockSendQuery = async (queryText: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 简单的模拟回复逻辑
  const replies = {
    '你好': '你好！欢迎使用宗谱对话系统。',
    '介绍一下': '宗谱对话系统是一个智能问答平台，可以帮助您查询宗谱相关信息。',
    '如何使用': '在输入框中输入您的问题，系统会自动为您提供答案。',
    '谢谢': '不客气！如有任何问题，随时向我提问。',
  };
  
  const defaultReply = '感谢您的提问。这是一个模拟环境，我是AI助手。您的问题是：' + queryText;
  
  return {
    answer: replies[queryText] || defaultReply,
    sources: [],
  };
};

// 导出API，默认使用模拟API以便开发测试
export default {
  loginToServer: mockLoginToServer,
  getAuthStatus: mockGetAuthStatus,
  sendQuery: mockSendQuery,
};