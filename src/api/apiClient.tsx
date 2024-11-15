// src/api/apiClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.API_BASE_URL || 'http://78.140.241.59:8000/';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/`, // Ensure single slash
  headers: {
    'Content-Type': 'application/json',
  },
});

const endpoints = {
  REGISTER: 'user/register/',
  LOGIN: 'user/login/',
  USER: 'user/user/',
  USERS: 'user/users/',
  CENTERS: 'api/centers/',
  SECTIONS: 'api/sections/',
  CATEGORIES: 'api/categories/',
  SUBSCRIPTIONS: 'api/subscriptions/',
  SCHEDULES: 'api/schedules/',
  RECORDS: 'api/records/',
  FEEDBACKS: 'api/feedbacks/',
  CONFIRM_ATTENDANCE: 'api/records/confirm_attendance/',
  CANCEL_RESERVATION: 'api/records/cancel_reservation/',
  PASSWORD_RESET: 'user/password-reset/',
};

const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token || null;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
      refresh: refreshToken,
    });
    await AsyncStorage.setItem('accessToken', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

// Axios interceptor to add the access token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to handle 401 errors (expired tokens)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance, endpoints, axios };
