export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emergencyContacts?: EmergencyContact[];
  preferences?: UserPreferences;
  lastActive?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship?: string;
  priority: number;
  status: EmergencyContactStatus;
  notifySos: boolean;
  notifyGeofence: boolean;
  notifyInactivity: boolean;
  notifyLowBattery: boolean;
  notes?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EmergencyContactStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DECLINED = 'DECLINED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  emergencyHoldTime: number;
  locationSharing: boolean;
  autoEmergencyActivation: boolean;
} 