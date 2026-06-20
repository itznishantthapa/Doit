import axios from 'axios';
import { authBridge } from './authBridge';
import { endpoints } from './endpoints';

let refreshPromise = null;

const isPublicAuthRequest = (url) =>
  url?.includes(endpoints.login) ||
  url?.includes(endpoints.create) ||
  url?.includes(endpoints.refresh);

const shouldLogoutOnRefreshFailure = (refreshError) => {
  if (refreshError?.message === 'No refresh token') {
    return true;
  }

  const status = refreshError?.response?.status;

  if (status === 401 || refreshError?.response?.data?.refresh_expired) {
    return true;
  }

  return false;
};

const getRefreshedAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = authBridge
      .refreshAccessToken()
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};




export const API_CLIENT = axios.create({
  baseURL: 'https://doit.level.com.np',  
  // baseURL: 'http://192.168.1.142:8000',  
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});





API_CLIENT.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

  const accessToken = authBridge.getAccessToken();

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
      !originalRequest.url?.includes(endpoints.refresh) &&
      !originalRequest.url?.includes(endpoints.logout) &&
      !originalRequest.url?.includes(endpoints.delete_account)
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await getRefreshedAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return API_CLIENT(originalRequest);
      } catch (refreshError) {
        if (shouldLogoutOnRefreshFailure(refreshError)) {
          await authBridge.logout();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);