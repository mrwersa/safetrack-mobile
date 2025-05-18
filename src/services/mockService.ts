/**
 * This service provides mock data for development and testing
 * when running in web browser environments where native features are not available
 */

import { User } from '../types';

/**
 * Mock user data for development/testing
 */
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User'
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User'
  }
];

/**
 * Mock login function for development/testing
 */
export const mockLogin = (username: string, password: string) => {
  // For development, accept any non-empty password for these users
  const mockUser = mockUsers.find(user => user.username === username.toLowerCase());
  
  if (mockUser && password) {
    return {
      success: true,
      token: 'mock-jwt-token',
      user: mockUser
    };
  }
  
  return {
    success: false,
    message: 'Invalid username or password'
  };
};

/**
 * Mock location data for development/testing
 */
export const getMockLocation = () => {
  // Generate random coordinates near New York City
  const latitude = 40.7128 + (Math.random() - 0.5) * 0.1;
  const longitude = -74.006 + (Math.random() - 0.5) * 0.1;
  
  return {
    coords: {
      latitude,
      longitude,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  };
};

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = () => {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
};

/**
 * Helper to check if we're running in a browser
 */
export const isBrowser = () => {
  return typeof window !== 'undefined';
};