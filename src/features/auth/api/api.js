import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CLIENT } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';

const AUTH_KEYS = ['@access_token', '@refresh_token', '@user'];

const persistAuthData = async (tokens, user) => {
  if (!tokens?.access || !tokens?.refresh || !user) {
    throw new Error('Incomplete auth data received.');
  }

  await AsyncStorage.multiSet([
    ['@access_token', tokens.access],
    ['@refresh_token', tokens.refresh],
    ['@user', JSON.stringify(user)],
  ]);

  return {
    user,
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
  };
};

export const getStoredAuthData = async () => {
  const accessToken = await AsyncStorage.getItem('@access_token');
  const refreshToken = await AsyncStorage.getItem('@refresh_token');
  const user = await AsyncStorage.getItem('@user');

  return {
    accessToken,
    refreshToken,
    user: user ? JSON.parse(user) : null,
  };
};

export const clearStoredAuthData = async () => {
  await AsyncStorage.multiRemove(AUTH_KEYS);
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
  return error?.response?.data?.message ?? fallback;
};

export const apiLogin = async (payload) => {
  const response = await API_CLIENT.post(endpoints.login, payload);
  const { tokens, user } = response.data;
  return persistAuthData(tokens, user);
};

export const apiCreate = async (payload) => {
  const response = await API_CLIENT.post(endpoints.create, payload);
  const { tokens, user } = response.data;
  return persistAuthData(tokens, user);
};


export const apiRefreshToken = async (refreshToken) => {
  const response = await API_CLIENT.post(endpoints.refresh, {
    refresh: refreshToken,
  });

  const accessToken = response.data.access;

  await AsyncStorage.setItem('@access_token', accessToken);

  return accessToken;
};

export const apiSyncPushToken = async (fcmToken) => {
  const response = await API_CLIENT.post(endpoints.post_fcm_token, { token: fcmToken });
  return response.data;
};


export const apiGetUserData = async () => {
  const response = await API_CLIENT.get(endpoints.get_user);
  const { user } = response.data;
  await AsyncStorage.setItem('@user', JSON.stringify(user));
  return user;
};

export const apiLogout = async () => {
  const response = await API_CLIENT.post(endpoints.logout);
  return response.data;
};

export const apiDeleteAccount = async () => {
  const response = await API_CLIENT.post(endpoints.delete_account);
  return response.data;
};