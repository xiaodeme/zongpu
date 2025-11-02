import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/state';
import { mockLoginToServer, mockGetAuthStatus } from '../api/lightrag';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LockIcon, UserIcon, AlertCircleIcon } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const authCheckRef = useRef(false);

  // 检查认证状态
  useEffect(() => {
    const checkAuthConfig = async () => {
      if (authCheckRef.current) return;
      authCheckRef.current = true;

      try {
        // 如果已经认证，重定向到首页
        if (isAuthenticated) {
          navigate('/');
          return;
        }

        // 检查认证状态
        const status = await mockGetAuthStatus();

        if (!status.auth_configured && status.access_token) {
          // 如果未配置认证，使用访客token
          login(status.access_token, true, status.core_version, status.api_version, null, null);
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('检查认证配置失败:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthConfig();
  }, [isAuthenticated, login, navigate]);

  // 加载中不渲染任何内容
  if (checkingAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      setLoading(true);
      const response = await mockLoginToServer(username, password);

      // 保存上一次登录的用户名
      localStorage.setItem('ZONGPU-PREVIOUS-USER', username);

      // 登录成功
      login(
        response.access_token,
        false,
        response.core_version || '',
        response.api_version || '',
        null,
        null
      );

      // 显示成功消息
      toast.success(`欢迎回来，${username}！`);

      // 重定向到首页
      navigate('/');
    } catch (error: any) {
      setError(error?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">宗谱对话系统</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">请登录以继续</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md flex items-center">
                <AlertCircleIcon className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">用户名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <LockIcon className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">默认密码：123456</p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;