export interface User {
  id: string;
  name: string;
  email: string;
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
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  emergencyHoldTime: number;
  locationSharing: boolean;
  autoEmergencyActivation: boolean;
} 