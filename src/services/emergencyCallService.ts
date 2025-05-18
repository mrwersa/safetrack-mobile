import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import api from '../utils/api';
import { EmergencyNumber, EmergencyServiceType, EmergencyState } from '../types/emergency';

class EmergencyCallService {
  private emergencyNumbers: EmergencyNumber[] = [];
  private currentCountry: string = '';
  private isInCall: boolean = false;
  private emergencyState: EmergencyState = {
    isActive: false,
    type: 'general',
    notifiedContacts: []
  };

  constructor() {
    this.loadEmergencyNumbers();
    this.detectCountry();
  }

  /**
   * Load emergency numbers from storage or API
   */
  private async loadEmergencyNumbers(): Promise<void> {
    try {
      // Try to load from cache first
      const cached = localStorage.getItem('emergencyNumbers');
      if (cached) {
        this.emergencyNumbers = JSON.parse(cached);
      }

      // Fetch latest numbers from API
      const response = await api.get('/emergency-numbers');
      this.emergencyNumbers = response.data;
      localStorage.setItem('emergencyNumbers', JSON.stringify(this.emergencyNumbers));
    } catch (error) {
      console.error('Error loading emergency numbers:', error);
      
      // Use hardcoded fallback numbers if needed
      if (this.emergencyNumbers.length === 0) {
        this.emergencyNumbers = [
          {
            country: 'US',
            police: '911',
            ambulance: '911',
            fire: '911',
            general: '911'
          },
          {
            country: 'GB',
            police: '999',
            ambulance: '999',
            fire: '999',
            general: '112'
          }
          // Add more countries as needed
        ];
      }
    }
  }

  /**
   * Detect current country based on location
   */
  private async detectCountry(): Promise<void> {
    try {
      const language = await Device.getLanguageCode();
      this.currentCountry = language.value.split('-')[1] || 'US';
    } catch (error) {
      console.error('Error detecting country:', error);
      this.currentCountry = 'US'; // Default to US
    }
  }

  /**
   * Get emergency numbers for current country
   */
  private getLocalEmergencyNumbers(): EmergencyNumber {
    const defaultNumbers: EmergencyNumber = {
      country: 'US',
      police: '911',
      ambulance: '911',
      fire: '911',
      general: '911'
    };

    return this.emergencyNumbers.find(n => n.country === this.currentCountry) || defaultNumbers;
  }

  /**
   * Call emergency services
   */
  async callEmergency(
    type: 'police' | 'ambulance' | 'fire' | 'general' = 'general',
    location?: { latitude: number; longitude: number }
  ): Promise<void> {
    if (this.isInCall) return;

    try {
      this.isInCall = true;

      // Get emergency number
      const numbers = this.getLocalEmergencyNumbers();
      const number = numbers[type];

      // Prepare location information
      let currentLocation = location;
      if (!currentLocation) {
        const position = await Geolocation.getCurrentPosition();
        currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      }

      // Prepare emergency information
      await this.prepareEmergencyInfo(currentLocation);

      // Make the call using the native API
      if (Capacitor.isNativePlatform()) {
        const url = `tel:${number}`;
        await Capacitor.getPlatform() === 'ios'
          ? window.open(url)
          : window.open(`intent:${number}#Intent;scheme=tel;action=android.intent.action.CALL;end`);
      } else {
        window.location.href = `tel:${number}`;
      }

      // Record the emergency call
      await this.recordEmergencyCall(type, currentLocation);

    } catch (error) {
      console.error('Error making emergency call:', error);
      throw error;
    } finally {
      this.isInCall = false;
    }
  }

  /**
   * Prepare emergency information to relay to operator
   */
  private async prepareEmergencyInfo(location: { latitude: number; longitude: number }): Promise<void> {
    try {
      // Get address from coordinates
      const response = await api.get(
        `/reverse-geocode?lat=${location.latitude}&lon=${location.longitude}`
      );
      const address = response.data.formatted_address;

      // Prepare speech
      const info = `Emergency location is ${address}. ` +
        `Coordinates are: Latitude ${location.latitude.toFixed(6)}, ` +
        `Longitude ${location.longitude.toFixed(6)}.`;

      // Use text-to-speech to help relay information
      await TextToSpeech.speak({
        text: info,
        lang: 'en-US',
        rate: 0.8,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });

    } catch (error) {
      console.error('Error preparing emergency info:', error);
    }
  }

  /**
   * Record emergency call in system
   */
  private async recordEmergencyCall(
    type: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      await api.post('/emergency-calls', {
        type,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error recording emergency call:', error);
    }
  }

  /**
   * Get emergency number for a specific type
   */
  async getEmergencyNumber(type: EmergencyServiceType = 'general'): Promise<string> {
    const numbers = this.getLocalEmergencyNumbers();
    return numbers[type];
  }

  /**
   * Check if currently in an emergency call
   */
  isCallInProgress(): boolean {
    return this.isInCall;
  }

  /**
   * Get current country code
   */
  getCurrentCountry(): string {
    return this.currentCountry;
  }
}

export const emergencyCallService = new EmergencyCallService(); 