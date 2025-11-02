import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './features/LoginPage';
import ChatPage from './features/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export default router;