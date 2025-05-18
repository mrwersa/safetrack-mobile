export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AlertState {
  message: string | null;
  type: 'success' | 'warning' | 'danger' | 'info' | null;
  isOpen: boolean;
}

export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  altitude?: number;
  locationType?: string;
  isEmergency: boolean;
  notes?: string;
  createdAt: string;
}

export enum EmergencyContactStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DECLINED = 'DECLINED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface EmergencyContact {
  id: string;
  userId: string;
  contactUserId?: string;
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
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

export interface RootState {
  auth: AuthState;
  alert: AlertState;
}