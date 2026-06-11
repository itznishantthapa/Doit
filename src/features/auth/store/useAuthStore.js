import { create } from 'zustand';
import {
  clearStoredAuthData,
  apiCreate,
  apiLogin,
  getStoredAuthData,
} from '../api/api';

export const useAuthStore = create((set, get) => ({
  user: undefined, // undefined = loading, null = logged out, object = logged in
  accessToken: null,
  refreshToken: null,
  isInitialized: false,

  initializeAuth: async () => {
    if (get().isInitialized) return;

    try {
      const { accessToken, refreshToken, user } = await getStoredAuthData();

      set({
        user,
        accessToken,
        refreshToken,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isInitialized: true,
      });
    }
  },

  login: async (payload) => {
    const auth = await apiLogin(payload);
    set({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    });
    return auth.user;
  },

  create: async (payload) => {
    const auth = await apiCreate(payload);
    set({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    });
    return auth.user;
  },

  logout: async () => {
    await clearStoredAuthData();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));
