import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 在应用启动时输出调试信息（帮助排查手机访问问题）
console.log('=== 应用启动调试信息 ===');
console.log('当前访问地址信息:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  port: window.location.port,
  href: window.location.href,
  origin: window.location.origin,
});
console.log('环境变量 VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || '(未设置)');
console.log('=== 调试信息结束 ===');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);