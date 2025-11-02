import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './features/LoginPage';
import ChatPage from './features/ChatPage';

/**
 * 应用路由配置
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export default router;