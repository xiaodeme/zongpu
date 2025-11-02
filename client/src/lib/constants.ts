/**
 * 动态获取后端API基础URL（仅在模块初始化时调用）
 * 注意：这个值仅作为axios实例的初始值，实际请求时会通过拦截器动态更新
 * 优先使用环境变量VITE_BACKEND_URL
 * 否则根据当前页面的hostname自动生成（适用于手机访问同一局域网的情况）
 */
function getBackendBaseUrl(): string {
  // 如果设置了环境变量，直接使用
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // 否则根据当前页面的hostname动态生成
  // 前端运行在3000端口，后端运行在9621端口
  // 注意：这个函数在模块加载时调用，可能在SSR或构建时执行
  // 如果window不存在，返回默认值
  if (typeof window === 'undefined') {
    return 'http://localhost:9621';
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // 如果是localhost或127.0.0.1，保持原样（开发环境）
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    return 'http://localhost:9621';
  }
  
  // 否则使用相同的hostname，但端口改为9621（生产环境）
  // 注意：实际请求时会通过getDynamicBackendUrl()动态获取正确的URL
  return `${protocol}//${hostname}:9621`;
}

// 这个值仅作为axios实例的初始值，实际请求时会动态更新
export const backendBaseUrl = getBackendBaseUrl();

/**
 * 默认请求超时时间（毫秒）
 */
export const defaultTimeout = 30000;