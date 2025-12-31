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

// Response interceptor - extract server errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const serverMessage = error.response.data?.detail 
        || error.response.data?.message
        || error.response.data?.error
        || (typeof error.response.data === 'string' ? error.response.data : null)
        || `Request failed with status ${error.response.status}`;      
      throw new Error(serverMessage);
    }
    throw new Error(error.message || 'Network error');
  }
);

export { apiClient };