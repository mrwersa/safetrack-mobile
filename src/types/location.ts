export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  createdAt: string;
  isEmergency: boolean;
  locationType: 'USER_RECORDED' | 'EMERGENCY' | 'TRACKING';
  accuracy: number;
  notes?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    formattedAddress: string;
  };
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface LocationBatch {
  locations: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  }>;
} 