import { create } from 'zustand';

/**
 * 认证状态接口
 */
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  isGuest: boolean;
  coreVersion: string;
  apiVersion: string;
  webuiTitle: string | null;
  webuiDescription: string | null;
  login: (token: string, isGuest: boolean, coreVersion: string, apiVersion: string, title: string | null, description: string | null) => void;
  logout: () => void;
}

/**
 * 认证Store
 * 管理用户认证状态和token
 */
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: '',
  isGuest: false,
  coreVersion: '',
  apiVersion: '',
  webuiTitle: null,
  webuiDescription: null,
  
  /**
   * 登录
   * @param token 访问令牌
   * @param isGuest 是否为访客
   * @param coreVersion 核心版本
   * @param apiVersion API版本
   * @param title WebUI标题
   * @param description WebUI描述
   */
  login: (token, isGuest, coreVersion, apiVersion, title, description) => set({
    isAuthenticated: true,
    accessToken: token,
    isGuest,
    coreVersion,
    apiVersion,
    webuiTitle: title,
    webuiDescription: description
  }),
  
  /**
   * 退出登录
   */
  logout: () => set({
    isAuthenticated: false,
    accessToken: '',
    isGuest: false
  })
}));