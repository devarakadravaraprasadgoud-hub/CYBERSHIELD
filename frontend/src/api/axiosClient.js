import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach access token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cybershield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized token refresh attempt once
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('cybershield_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('cybershield_token');
        localStorage.removeItem('cybershield_user');
      }
    }

    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject({
      message,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors || null
    });
  }
);

export default axiosClient;
