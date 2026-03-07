import axios from 'axios';

// We will use recoil-nexus to reset atom outside react components or 
// alternatively handle the 401 locally or inside App.jsx using Axios interceptors inside a hook.
// A simpler robust way for Recoil + Axios interceptor without nexus:
// We just create an instance and the caller/hook can attach the interceptor.

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    // Check if the backend response is an ApiResponse wrapped object
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Just extract the actual entity payload
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authState');
      window.location.href = '/login?sessionExpired=true';
    } else if (
      error.response && 
      error.response.status === 500 && 
      error.response.data?.message?.includes('session')
    ) {
      localStorage.removeItem('authState');
      window.location.href = '/login?sessionExpired=true';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
