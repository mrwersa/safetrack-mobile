import api from '../utils/api';
import { User } from '../types';

const AUTH_ENDPOINT = '/auth';

interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

interface RegisterResponse {
  id: string;
  username: string;
  message: string;
}

/**
 * Format the raw API response to include user details
 */
const formatLoginResponse = (response: { token: string; message: string }): LoginResponse => {
  // Extract user data from JWT token
  // In a real app, you might prefer to get user data from a separate endpoint
  // or include it in the login response directly
  const token = response.token;
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  const payload = JSON.parse(atob(tokenParts[1]));
  const user: User = {
    id: payload.sub || '',
    username: payload.username || '',
    email: payload.email || '',
    firstName: payload.firstName,
    lastName: payload.lastName
  };

  return {
    token,
    user,
    message: response.message
  };
};

/**
 * Authentication service
 */
const authService = {
  /**
   * Login a user
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post(`${AUTH_ENDPOINT}/login`, {
      username,
      password
    });
    
    const formattedResponse = formatLoginResponse(response.data);
    return formattedResponse;
  },

  /**
   * Register a new user
   */
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<RegisterResponse> => {
    const response = await api.post(`${AUTH_ENDPOINT}/register`, userData);
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get the authorization header
   */
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;