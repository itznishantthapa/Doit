import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const {useAuthStore} = require('../features/auth/store/useAuthStore');

export const API_CLIENT = axios.create({
  baseURL: 'http://192.168.1.139:8000', // Update with your backend URL
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

API_CLIENT.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('@access_token');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});