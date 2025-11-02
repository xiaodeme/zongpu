import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import router from './AppRouter';

/**
 * 应用主组件
 * 提供全局toast通知和路由
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;