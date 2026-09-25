import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'सर्वर से संपर्क करने में त्रुटि हुई। कृपया पुनः प्रयास करें।';
    
    return Promise.reject(new Error(message));
  }
);
