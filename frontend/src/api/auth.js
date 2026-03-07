import axiosInstance from '../utils/axiosInstance';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data; // Should return { userId, username, userType, message }
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const checkSession = async () => {
  const response = await axiosInstance.get('/auth/session');
  return response.data;
};
