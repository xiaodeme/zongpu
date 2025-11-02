import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/state';

/**
 * 受保护路由组件属性
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 受保护的路由组件
 * 如果用户未认证，重定向到登录页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // 简单的条件渲染：已认证则显示内容，否则重定向到登录页
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;