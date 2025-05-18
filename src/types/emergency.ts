export interface EmergencyNumber {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  general: string;
}

export type EmergencyServiceType = 'police' | 'ambulance' | 'fire' | 'general';

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship?: string;
  priority: number;
  lastNotified?: string;
}

export interface EmergencyState {
  isActive: boolean;
  activatedAt?: string;
  type: EmergencyServiceType;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  notifiedContacts: string[]; // IDs of notified contacts
}

export interface EmergencySettings {
  autoActivateThreshold: number; // minutes of inactivity
  notificationDelay: number; // seconds before notifying contacts
  repeatNotifications: boolean;
  notificationInterval: number; // minutes between repeat notifications
} 