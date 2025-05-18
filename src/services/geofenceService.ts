import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import api from '../utils/api';
import { feedback } from '../utils/feedback';

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address?: string;
  notes?: string;
  isActive: boolean;
}

class GeofenceService {
  private watchId: string | null = null;
  private safeZones: SafeZone[] = [];
  private currentZone: SafeZone | null = null;

  /**
   * Start monitoring safe zones
   */
  async startMonitoring(): Promise<void> {
    try {
      // Load safe zones from the server
      await this.loadSafeZones();

      // Start watching location
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        (position) => {
          if (position) {
            this.checkSafeZones(position.coords.latitude, position.coords.longitude);
          }
        }
      );
    } catch (error) {
      console.error('Error starting geofence monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring safe zones
   */
  async stopMonitoring(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  /**
   * Load safe zones from the server
   */
  private async loadSafeZones(): Promise<void> {
    try {
      const response = await api.get('/safe-zones');
      this.safeZones = response.data;
    } catch (error) {
      console.error('Error loading safe zones:', error);
      // Use cached safe zones if available
      const cached = localStorage.getItem('safeZones');
      if (cached) {
        this.safeZones = JSON.parse(cached);
      }
    }
  }

  /**
   * Check if location is within any safe zone
   */
  private async checkSafeZones(latitude: number, longitude: number): Promise<void> {
    for (const zone of this.safeZones) {
      if (!zone.isActive) continue;

      const distance = this.calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      );

      const isInZone = distance <= zone.radius;
      const wasInZone = this.currentZone?.id === zone.id;

      // Entered safe zone
      if (isInZone && !wasInZone) {
        this.currentZone = zone;
        await this.handleSafeZoneEntry(zone);
      }
      // Left safe zone
      else if (!isInZone && wasInZone && this.currentZone?.id === zone.id) {
        this.currentZone = null;
        await this.handleSafeZoneExit(zone);
      }
    }
  }

  /**
   * Handle safe zone entry
   */
  private async handleSafeZoneEntry(zone: SafeZone): Promise<void> {
    try {
      // Notify user
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Entered Safe Zone',
            body: `You have entered ${zone.name}`,
            id: 1,
            schedule: { at: new Date(Date.now()) }
          }
        ]
      });

      feedback.playNotificationSound();

      // Update server
      await api.post(`/safe-zones/${zone.id}/entry`, {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling safe zone entry:', error);
    }
  }

  /**
   * Handle safe zone exit
   */
  private async handleSafeZoneExit(zone: SafeZone): Promise<void> {
    try {
      // Notify user
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Left Safe Zone',
            body: `You have left ${zone.name}`,
            id: 2,
            schedule: { at: new Date(Date.now()) }
          }
        ]
      });

      feedback.playNotificationSound();

      // Update server
      await api.post(`/safe-zones/${zone.id}/exit`, {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling safe zone exit:', error);
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Add a new safe zone
   */
  async addSafeZone(zone: Omit<SafeZone, 'id'>): Promise<SafeZone> {
    try {
      const response = await api.post('/safe-zones', zone);
      const newZone = response.data;
      this.safeZones.push(newZone);
      return newZone;
    } catch (error) {
      console.error('Error adding safe zone:', error);
      throw error;
    }
  }

  /**
   * Update an existing safe zone
   */
  async updateSafeZone(zone: SafeZone): Promise<SafeZone> {
    try {
      const response = await api.put(`/safe-zones/${zone.id}`, zone);
      const updatedZone = response.data;
      const index = this.safeZones.findIndex(z => z.id === zone.id);
      if (index >= 0) {
        this.safeZones[index] = updatedZone;
      }
      return updatedZone;
    } catch (error) {
      console.error('Error updating safe zone:', error);
      throw error;
    }
  }

  /**
   * Delete a safe zone
   */
  async deleteSafeZone(zoneId: string): Promise<void> {
    try {
      await api.delete(`/safe-zones/${zoneId}`);
      this.safeZones = this.safeZones.filter(z => z.id !== zoneId);
    } catch (error) {
      console.error('Error deleting safe zone:', error);
      throw error;
    }
  }

  /**
   * Get all safe zones
   */
  getSafeZones(): SafeZone[] {
    return this.safeZones;
  }

  /**
   * Get current safe zone if any
   */
  getCurrentZone(): SafeZone | null {
    return this.currentZone;
  }
}

export const geofenceService = new GeofenceService(); 