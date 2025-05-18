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
  address?: Address;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

export interface LocationBatch {
  locations: Array<LocationPoint>;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface GeocodingResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  place_id: string;
  types: string[];
}

export interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
} 