import { create } from 'zustand';
import {
  clearStoredAuthData,
  apiCreate,
  apiLogin,
  apiRefreshToken as refreshAccessToken,
  getStoredAuthData,
  apiSyncPushToken,
  apiGetUserData,
} from '../api/api';
import { Keyboard } from 'react-native';
import { registerAuthHandlers } from '../../../services/authBridge';

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
    Keyboard.dismiss();
    await new Promise(resolve => setTimeout(resolve, 2000));
    set({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    });
    return auth.user;
  },

  create: async (payload) => {
    const auth = await apiCreate(payload);
    Keyboard.dismiss();
    await new Promise(resolve => setTimeout(resolve, 2000));
    set({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    });
    return auth.user;
  },


  apiRefreshToken: async () => {
    const refreshToken = get().refreshToken;

    if (!refreshToken) {
      await get().logout();
      throw new Error('No refresh token');
    }

    const accessToken = await refreshAccessToken(refreshToken);

    set({ accessToken });

    return accessToken;
  },

  logout: async () => {
    await clearStoredAuthData();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },



  syncPushToken: async (fcmToken) => {
    if (!fcmToken) return;

    await apiSyncPushToken(fcmToken);
    await get().getUserData();
  },

  getUserData: async () => {
    const user = await apiGetUserData();
    set({ user });
    return user;
  },



}));

registerAuthHandlers({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().apiRefreshToken(),
  logout: () => useAuthStore.getState().logout(),
});
