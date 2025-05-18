import axios from 'axios';
import { environment } from '../environments/environment';

// Create an axios instance with default configurations
const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Log the error for debugging
      console.log('API Error:', error.response?.status, error.response?.data);
      
      // Handle authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        // You could dispatch a logout action here if needed
        console.log('Authentication error');
      }
    }
    return Promise.reject(error);
  }
);

export default api;