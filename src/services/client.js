import axios from 'axios';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { endpoints } from './endpoints';

let refreshPromise = null;

const getRefreshedAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = useAuthStore
      .getState()
      .apiRefreshToken()
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};




export const API_CLIENT = axios.create({
  baseURL: 'http://192.168.1.139:8000', // Update with your backend URL
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});





API_CLIENT.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});




API_CLIENT.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(endpoints.refresh)
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await getRefreshedAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return API_CLIENT(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);