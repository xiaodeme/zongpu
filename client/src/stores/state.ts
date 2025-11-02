import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: '',
  isGuest: false,
  coreVersion: '',
  apiVersion: '',
  webuiTitle: null,
  webuiDescription: null,
  login: (token, isGuest, coreVersion, apiVersion, title, description) => set({ 
    isAuthenticated: true, 
    accessToken: token, 
    isGuest,
    coreVersion,
    apiVersion,
    webuiTitle: title,
    webuiDescription: description
  }),
  logout: () => set({ 
    isAuthenticated: false, 
    accessToken: '', 
    isGuest: false
  })
}));