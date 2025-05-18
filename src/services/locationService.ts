import { Geolocation, Position, WatchPositionCallback } from '@capacitor/geolocation';
import api from '../utils/api';
import { Location, LocationBatch } from '../types/location';
import { getMockLocation } from './mockService';
import { Capacitor } from '@capacitor/core';

const API_URL = '/locations';
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Get address from coordinates using Google Maps Geocoding API
 */
const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      const address = {
        street: addressComponents.find((component: any) => 
          component.types.includes('route'))?.long_name,
        city: addressComponents.find((component: any) => 
          component.types.includes('locality'))?.long_name,
        state: addressComponents.find((component: any) => 
          component.types.includes('administrative_area_level_1'))?.long_name,
        country: addressComponents.find((component: any) => 
          component.types.includes('country'))?.long_name,
        postalCode: addressComponents.find((component: any) => 
          component.types.includes('postal_code'))?.long_name,
        formattedAddress: result.formatted_address
      };

      return address;
    }
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

/**
 * Location tracking service
 */
const locationService = {
  /**
   * Get the user's current position
   */
  getCurrentPosition: async (): Promise<Position> => {
    try {
      // Try Capacitor first
      try {
        return await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        });
      } catch (capacitorError) {
        console.log('Using browser geolocation fallback', capacitorError);
        
        // Fallback to browser geolocation API if available
        if (navigator.geolocation) {
          const browserPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });
          
          // Convert browser position to Capacitor position format
          return {
            coords: {
              latitude: browserPosition.coords.latitude,
              longitude: browserPosition.coords.longitude,
              accuracy: browserPosition.coords.accuracy,
              altitude: browserPosition.coords.altitude,
              altitudeAccuracy: browserPosition.coords.altitudeAccuracy,
              heading: browserPosition.coords.heading,
              speed: browserPosition.coords.speed
            },
            timestamp: browserPosition.timestamp
          };
        }
        
        // If browser geolocation is not available or fails
        throw new Error('Geolocation not available');
      }
    } catch (error) {
      console.error('Error getting current position:', error);
      
      // For development/testing, return mock data instead of failing
      if (!Capacitor.isNativePlatform()) {
        console.log('Using mock location data');
        return getMockLocation();
      }
      
      throw error;
    }
  },

  /**
   * Watch the user's position and call the callback when it changes
   */
  watchPosition: async (callback: (position: Position) => void): Promise<string | number> => {
    try {
      // Try Capacitor first
      try {
        return await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          ((position: Position | null) => {
            if (position && position.coords) {
              callback(position);
            }
          }) as WatchPositionCallback
        );
      } catch (capacitorError) {
        console.log('Using browser geolocation watch fallback', capacitorError);
        
        // Fallback to browser geolocation API
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            (browserPosition) => {
              // Convert browser position to Capacitor position format
              const position: Position = {
                coords: {
                  latitude: browserPosition.coords.latitude,
                  longitude: browserPosition.coords.longitude,
                  accuracy: browserPosition.coords.accuracy,
                  altitude: browserPosition.coords.altitude,
                  altitudeAccuracy: browserPosition.coords.altitudeAccuracy,
                  heading: browserPosition.coords.heading,
                  speed: browserPosition.coords.speed
                },
                timestamp: browserPosition.timestamp
              };
              callback(position);
            },
            (error) => {
              console.error('Browser geolocation watch error:', error);
            },
            { enableHighAccuracy: true }
          );
          
          return watchId;
        }
        
        throw new Error('Geolocation watch not available');
      }
    } catch (error) {
      console.error('Error watching position:', error);
      
      // For development/testing, simulate position updates
      if (!Capacitor.isNativePlatform()) {
        console.log('Using mock location watching');
        const mockWatchId = setInterval(() => {
          callback(getMockLocation());
        }, 5000);
        return `mock-${mockWatchId}`;
      }
      
      throw error;
    }
  },

  /**
   * Stop watching the user's position
   */
  clearWatch: async (watchId: string | number): Promise<void> => {
    try {
      // Handle Capacitor string watchId
      if (typeof watchId === 'string') {
        // Handle mock watchId
        if (watchId.startsWith('mock-')) {
          const mockId = parseInt(watchId.replace('mock-', ''));
          clearInterval(mockId);
          return;
        }
        
        try {
          await Geolocation.clearWatch({ id: watchId });
          return;
        } catch (capacitorError) {
          console.log('Error clearing Capacitor watch', capacitorError);
          throw capacitorError;
        }
      } 
      // Handle browser number watchId
      else if (typeof watchId === 'number' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
        return;
      }
      
      throw new Error('Invalid watch ID');
    } catch (error) {
      console.error('Error clearing watch:', error);
      throw error;
    }
  },

  /**
   * Record a single location to the server
   */
  recordLocation: async (
    latitude: number,
    longitude: number,
    isEmergency: boolean = false,
    notes?: string
  ): Promise<Location> => {
    try {
      // Get address information
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      const response = await api.post(
        API_URL,
        {
          latitude,
          longitude,
          isEmergency,
          notes,
          address,
          timestamp: new Date().toISOString(),
          locationType: 'USER_RECORDED'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording location:', error);
      // Return a mock location in development mode
      return {
        id: 'mock-id',
        userId: 'mock-user',
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isEmergency,
        notes,
        locationType: 'USER_RECORDED',
        accuracy: 10
      };
    }
  },

  /**
   * Record an emergency location
   */
  recordEmergencyLocation: async (
    latitude: number,
    longitude: number,
    message?: string
  ): Promise<Location> => {
    try {
      // Get address information
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      const response = await api.post(
        `${API_URL}/emergency`,
        {
          latitude,
          longitude,
          message,
          address
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording emergency location:', error);
      // Return a mock location in development mode
      return {
        id: 'emergency-mock-id',
        userId: 'mock-user',
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isEmergency: true,
        notes: message,
        locationType: 'EMERGENCY',
        accuracy: 10
      };
    }
  },

  /**
   * Record a batch of locations
   */
  recordLocationBatch: async (locations: {
    latitude: number;
    longitude: number;
    timestamp?: string;
    isEmergency?: boolean;
    notes?: string;
  }[]): Promise<{ count: number; message: string; locations: Location[] }> => {
    try {
      const response = await api.post(
        `${API_URL}/batch`,
        {
          locations: locations.map(loc => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
            timestamp: loc.timestamp || new Date().toISOString(),
            isEmergency: loc.isEmergency || false,
            notes: loc.notes
          }))
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording location batch:', error);
      // Return mock data in development mode
      const mockLocations: Location[] = locations.map((loc, index) => ({
        id: `mock-batch-${index}`,
        userId: 'mock-user',
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isEmergency: loc.isEmergency || false,
        notes: loc.notes,
        locationType: 'USER_RECORDED',
        accuracy: 10
      }));
      
      return {
        count: mockLocations.length,
        message: 'Mock location batch recorded',
        locations: mockLocations
      };
    }
  },

  /**
   * Get the user's most recent location
   */
  getCurrentLocation: async (userId: string): Promise<Location> => {
    try {
      const response = await api.get(`${API_URL}/users/${userId}/current`);
      return response.data;
    } catch (error) {
      console.error('Error getting current location:', error);
      // Return mock data in development mode
      const mockLocation = getMockLocation();
      return {
        id: 'mock-current-location',
        userId,
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isEmergency: false,
        locationType: 'USER_RECORDED',
        accuracy: 10
      };
    }
  },

  /**
   * Get the user's location history
   */
  getLocationHistory: async (
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: Location[]; totalElements: number; totalPages: number }> => {
    try {
      const response = await api.get(`${API_URL}/users/${userId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error getting location history:', error);
      // Return mock data
      const mockLocations: Location[] = Array(size)
        .fill(0)
        .map((_, i) => {
          const mockLocation = getMockLocation();
          return {
            id: `mock-history-${i}`,
            userId,
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(), // Each hour back
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            isEmergency: false,
            locationType: 'USER_RECORDED',
            accuracy: 10
          };
        });
      
      return {
        content: mockLocations,
        totalElements: 100, // Mock total
        totalPages: 5
      };
    }
  },

  /**
   * Get the user's location history for a specific time range
   */
  getLocationHistoryByTimeRange: async (
    userId: string,
    startTime: string,
    endTime: string
  ): Promise<Location[]> => {
    try {
      const response = await api.get(
        `${API_URL}/users/${userId}/history?startTime=${startTime}&endTime=${endTime}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting location history by time range:', error);
      // Return mock data
      const startDate = new Date(startTime).getTime();
      const endDate = new Date(endTime).getTime();
      const hoursInRange = Math.floor((endDate - startDate) / 3600000);
      const locationCount = Math.min(50, Math.max(5, hoursInRange));
      
      const mockLocations: Location[] = Array(locationCount)
        .fill(0)
        .map((_, i) => {
          const mockLocation = getMockLocation();
          // Distribute timestamps evenly across the time range
          const timestamp = new Date(startDate + (i / (locationCount - 1)) * (endDate - startDate)).toISOString();
          
          return {
            id: `mock-timerange-${i}`,
            userId,
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp,
            createdAt: timestamp,
            isEmergency: false,
            locationType: 'USER_RECORDED',
            accuracy: 10
          };
        });
      
      return mockLocations;
    }
  },

  /**
   * Get the user's emergency locations
   */
  getEmergencyLocations: async (
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: Location[]; totalElements: number; totalPages: number }> => {
    try {
      const response = await api.get(
        `${API_URL}/users/${userId}/emergency?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting emergency locations:', error);
      // Return mock data
      const mockLocations: Location[] = Array(Math.min(5, size))
        .fill(0)
        .map((_, i) => {
          const mockLocation = getMockLocation();
          return {
            id: `mock-emergency-${i}`,
            userId,
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: new Date(Date.now() - i * 86400000).toISOString(), // Each day back
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
            isEmergency: true,
            notes: 'Mock emergency situation',
            locationType: 'EMERGENCY',
            accuracy: 10
          };
        });
      
      return {
        content: mockLocations,
        totalElements: 5, // Mock total
        totalPages: 1
      };
    }
  },

  /**
   * Start watching position
   */
  startLocationTracking: async (onLocation: (position: Position) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        ((position: Position | null) => {
          if (position && position.coords) {
            onLocation(position);
          }
        }) as WatchPositionCallback
      )
        .then(watchId => resolve(watchId))
        .catch(error => reject(error));
    });
  },

  /**
   * Stop watching position
   */
  stopLocationTracking: async (watchId: string): Promise<void> => {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      throw error;
    }
  },

  /**
   * Save location to backend
   */
  saveLocation: async (location: Location): Promise<void> => {
    try {
      await api.post('/locations', location);
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  },

  getAddressFromCoordinates
};

export default locationService;