import { createBrowserRouter } from 'react-router-dom';
import ChatPage from './features/ChatPage';

/**
 * 应用路由配置
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
]);

export default router;