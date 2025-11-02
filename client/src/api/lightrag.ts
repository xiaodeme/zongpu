import axios from 'axios';
import { backendBaseUrl, defaultTimeout } from '@/lib/constants';
import { useAuthStore } from '@/stores/state';

/**
 * 动态获取后端URL（与sendQueryStream中的逻辑一致）
 * 注意：此函数在每次请求时调用，确保使用运行时正确的hostname
 * 
 * 关键：此函数必须使用 window.location.hostname，而不是构建时的值
 */
function getDynamicBackendUrl(): string {
  // 如果设置了环境变量，检查是否为localhost
  // 如果是localhost且当前访问的是IP地址，则忽略环境变量，使用动态检测
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL;
  const currentHostname = window.location.hostname;
  
  if (envBackendUrl) {
    // 如果环境变量指向localhost，但当前访问的是IP地址，则使用动态检测
    const isEnvLocalhost = envBackendUrl.includes('localhost') || envBackendUrl.includes('127.0.0.1');
    const isCurrentIp = currentHostname && !['localhost', '127.0.0.1', ''].includes(currentHostname);
    
    if (isEnvLocalhost && isCurrentIp) {
      console.warn('[getDynamicBackendUrl] 环境变量指向localhost，但当前通过IP访问，将使用动态检测:', {
        envUrl: envBackendUrl,
        currentHostname: currentHostname,
      });
      // 继续执行动态检测逻辑，不直接返回环境变量
    } else {
      console.log('[getDynamicBackendUrl] 使用环境变量:', envBackendUrl);
      return envBackendUrl;
    }
  }
  
  // 获取当前页面的hostname和protocol（运行时获取，不是构建时）
  // 重要：使用 window.location 而不是任何全局变量
  const location = window.location;
  const hostname = location.hostname;
  const protocol = location.protocol;
  const port = location.port;
  const href = location.href;
  
  // 调试信息：始终输出（帮助排查问题）
  console.log('[getDynamicBackendUrl] 运行时页面信息:', {
    hostname,
    protocol,
    port,
    href,
    origin: location.origin,
  });
  
  // 判断是否为本地地址（localhost、127.0.0.1、或任何localhost变体）
  // 重要：只有当hostname确实是localhost相关值时才返回localhost
  // 如果是IP地址（如192.168.x.x），应该使用该IP地址
  const isLocalhost = 
    (hostname === 'localhost' || 
     hostname === '127.0.0.1' ||
     hostname === '[::1]' ||
     hostname.startsWith('127.')) &&
    hostname !== '';  // 空字符串不应该被认为是localhost，可能是IP地址解析问题
  
  // 如果hostname为空或无效，可能是某些浏览器的问题，尝试从href中提取
  let effectiveHostname = hostname;
  if (!effectiveHostname || effectiveHostname === '' || effectiveHostname.trim() === '') {
    console.warn('[getDynamicBackendUrl] hostname为空或无效，尝试从其他来源提取');
    try {
      const url = new URL(href);
      effectiveHostname = url.hostname;
      console.log('[getDynamicBackendUrl] 从href提取hostname:', effectiveHostname);
      
      // 验证提取的hostname是否有效
      if (!effectiveHostname || effectiveHostname === '') {
        throw new Error('从href提取的hostname仍然为空');
      }
    } catch (e) {
      console.warn('[getDynamicBackendUrl] 无法从href提取hostname:', e);
      // 如果仍然无法获取，使用origin
      try {
        if (location.origin) {
          const originUrl = new URL(location.origin);
          effectiveHostname = originUrl.hostname;
          console.log('[getDynamicBackendUrl] 从origin提取hostname:', effectiveHostname);
          
          if (!effectiveHostname || effectiveHostname === '') {
            throw new Error('从origin提取的hostname仍然为空');
          }
        } else {
          throw new Error('location.origin为空');
        }
      } catch (e2) {
        console.error('[getDynamicBackendUrl] 无法提取hostname，尝试从href解析完整URL');
        // 最后的尝试：直接从href解析
        try {
          // 尝试解析完整的href来获取hostname
          const match = href.match(/https?:\/\/([^:\/]+)/);
          if (match && match[1]) {
            effectiveHostname = match[1];
            console.log('[getDynamicBackendUrl] 从href正则提取hostname:', effectiveHostname);
          } else {
            throw new Error('无法从href中提取hostname');
          }
        } catch (e3) {
          console.error('[getDynamicBackendUrl] 所有提取方法都失败，使用默认值192.168.3.18');
          // 最后的fallback：使用已知的后端IP（仅用于开发环境）
          // 注意：这应该只在所有方法都失败时使用
          effectiveHostname = '192.168.3.18';
        }
      }
    }
  }
  
  // 重新判断是否为localhost（使用提取后的hostname）
  const isLocalhostAfterExtract = 
    effectiveHostname === 'localhost' || 
    effectiveHostname === '127.0.0.1' ||
    effectiveHostname === '[::1]' ||
    effectiveHostname.startsWith('127.');
  
  if (isLocalhostAfterExtract) {
    // 本地开发环境：使用localhost
    const url = 'http://localhost:9621';
    console.log('[getDynamicBackendUrl] 检测到本地地址:', effectiveHostname, '返回:', url);
    return url;
  }
  
  // 生产环境或通过IP访问：使用相同的hostname（使用提取后的hostname），但端口改为9621
  // 注意：protocol 已经是 'http:' 或 'https:'，需要加上 '//'
  const backendUrl = `${protocol}//${effectiveHostname}:9621`;
  console.log('[getDynamicBackendUrl] 使用动态URL（与前端同hostname，端口9621）:', backendUrl, '(hostname:', effectiveHostname, ')');
  
  // 验证URL格式
  try {
    new URL(backendUrl); // 验证URL格式是否正确
  } catch (e) {
    console.error('[getDynamicBackendUrl] URL格式错误:', backendUrl, e);
    // 如果格式错误，返回一个安全的fallback（但不应该是这种情况）
    return `http://${effectiveHostname}:9621`;
  }
  
  return backendUrl;
}

/**
 * 创建axios实例
 * 配置基础URL、超时时间和默认请求头
 * 注意：baseURL在请求拦截器中动态更新，以确保手机访问时使用正确的IP
 */
const api = axios.create({
  baseURL: backendBaseUrl, // 初始值，会在请求时动态更新
  timeout: defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 自动在请求头中添加认证token，并动态更新baseURL
 * 关键：每次请求都强制更新baseURL，确保非本机访问时使用正确的IP地址
 */
api.interceptors.request.use(
  (config) => {
    // 动态更新baseURL，确保每次请求都使用正确的主机名
    // 这对于手机访问同一局域网时特别重要
    // 注意：每次都强制更新，不检查是否相同，因为hostname可能在运行时变化
    const dynamicUrl = getDynamicBackendUrl();
    
    // 记录baseURL更新（用于调试）
    if (config.baseURL !== dynamicUrl) {
      console.log('[axios拦截器] 更新baseURL:', {
        old: config.baseURL,
        new: dynamicUrl,
        url: config.url,
        fullUrl: dynamicUrl + (config.url || ''),
      });
      config.baseURL = dynamicUrl;
    } else {
      // 即使相同也记录（帮助确认逻辑正确）
      console.log('[axios拦截器] baseURL已是最新:', {
        baseURL: dynamicUrl,
        url: config.url,
        fullUrl: dynamicUrl + (config.url || ''),
      });
    }
    
    // 从store获取token并添加到请求头
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器
 * 直接返回响应，错误由调用方处理
 */
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * 登录到服务器
 * @param username 用户名
 * @param password 密码
 * @returns 登录响应，包含access_token等信息
 */
export const loginToServer = async (username: string, password: string) => {
  // 准备表单数据
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  // 发送登录请求
  const response = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // 返回标准化的登录响应
  return {
    access_token: response.data.access_token,
    user_info: response.data.user_info || { username },
    core_version: response.data.core_version || '',
    api_version: response.data.api_version || '',
  };
};

/**
 * 处理登录错误
 * @param error 错误对象
 * @returns 格式化的错误信息
 */
export const handleLoginError = (error: any): string => {
  if (error.response?.status === 404) {
    return '后端未启用认证功能，无需登录';
  }
  if (error.response?.status === 401) {
    return '用户名或密码错误';
  }
  return error.response?.data?.detail || error.message || '登录失败，请重试';
};

/**
 * 获取认证状态
 * 检查后端是否启用认证，如果未启用则获取访客token
 * @returns 认证状态信息
 */
export const getAuthStatus = async () => {
  try {
    // 发送健康检查请求
    const { data: healthData } = await api.get('/health');
    
    // 初始化基本返回信息
    const baseInfo = {
      auth_configured: healthData.auth_mode !== 'disabled',
      access_token: null,
      core_version: healthData.core_version || '',
      api_version: healthData.api_version || '',
      webui_title: healthData.webui_title || null,
      webui_description: healthData.webui_description || null,
    };

    // 如果认证未启用，尝试获取访客token
    if (healthData.auth_mode === 'disabled') {
      try {
        const { data: authData } = await api.get('/auth-status');
        return {
          ...baseInfo,
          access_token: authData.access_token || null,
        };
      } catch {
        // 获取访客token失败，返回基本信息
        return baseInfo;
      }
    }

    return baseInfo;
  } catch {
    // 健康检查失败，返回默认值
    return {
      auth_configured: false,
      access_token: null,
      core_version: '',
      api_version: '',
      webui_title: null,
      webui_description: null,
    };
  }
};

/**
 * 流式查询API
 * 发送查询请求并实时接收响应流
 * @param queryText 查询文本
 * @param onData 接收到数据块时的回调函数
 * @param onComplete 完成时的回调函数
 * @param onError 错误时的回调函数
 */
export const sendQueryStream = async (
  queryText: string,
  onData: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    // 动态获取后端URL（每次请求时获取，确保使用正确的hostname）
    const backendUrl = getDynamicBackendUrl();
    const requestUrl = `${backendUrl}/query/stream`;
    
    // 构建请求参数
    const { accessToken } = useAuthStore.getState();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/x-ndjson',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    // 添加调试信息（始终输出，帮助排查手机访问问题）
    console.log('发送流式查询请求:', {
      url: requestUrl,
      backendUrl: backendUrl,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port,
      fullLocation: window.location.href,
    });

    // 发送POST请求
    const response = await fetch(requestUrl, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: JSON.stringify({
        query: queryText,
        mode: 'local',
        stream: true,
      }),
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `HTTP错误! 状态: ${response.status}, URL: ${requestUrl}, 信息: ${errorText}`;
      console.error('流式查询失败:', errorMsg);
      throw new Error(errorMsg);
    }

    // 获取响应流读取器
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流读取器');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    // 读取并处理流数据
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        // 处理每一行数据
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                onData(parsed.response);
              }
            } catch {
              // 解析失败，忽略该行
            }
          }
        }
      }
    }

    // 完成回调
    onComplete?.();
  } catch (error) {
    // 增强错误信息，包含更多调试细节
    let errorObj: Error;
    if (error instanceof Error) {
      // 如果是网络错误，添加更友好的提示
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const backendUrl = getDynamicBackendUrl();
        errorObj = new Error(`无法连接到后端服务器 (${backendUrl})。请检查：1. 后端服务是否运行在9621端口；2. 防火墙设置；3. 网络连接`);
      } else {
        errorObj = error;
      }
    } else {
      errorObj = new Error('流式查询未知错误');
    }
    
    console.error('流式查询错误详情:', {
      error: errorObj,
      url: getDynamicBackendUrl(),
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    });
    
    onError ? onError(errorObj) : console.error('流式查询错误:', errorObj);
  }
};

/**
 * 发送普通查询请求
 * @param queryText 查询文本
 * @returns 查询响应数据
 */
export const sendQuery = async (queryText: string) => {
  const response = await api.post('/query', {
    query: queryText,
    mode: 'local',
    stream: true
  });
  return response.data;
};