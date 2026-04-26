import axios from 'axios';

import { selectToken } from '../store/slices/authSlice';

const ENDPOINT = import.meta.env.VITE_API_URL as string

// Create axios instance
const apiClient = axios.create({
  baseURL: ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - runs before every request
apiClient.interceptors.request.use(
  async (config) => {
    const { store } = await import('../store/store'); // lazy import becuase this loads before the reducer 
    const state = store.getState();
    const token = selectToken(state);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor for unauthorised responses
apiClient.interceptors.response.use(
  (response) => {
    const isAuth = response.config.url === "/auth/login" || response.config.url === "/auth/register"
    if (!isAuth && response.status === 401) {
      localStorage.removeItem("auth_state");
      window.location.href = '/login';
    }
    return response;
  }
);

export { apiClient };