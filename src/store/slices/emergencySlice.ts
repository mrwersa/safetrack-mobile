import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../index';

interface EmergencyState {
  isActive: boolean;
  activatedAt: string | null;
  lastLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  activationStatus: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

const initialState: EmergencyState = {
  isActive: false,
  activatedAt: null,
  lastLocation: null,
  activationStatus: 'idle',
  error: null
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    activate: (state) => {
      state.isActive = true;
      state.activatedAt = new Date().toISOString();
      state.activationStatus = 'success';
      state.error = null;
    },
    deactivate: (state) => {
      state.isActive = false;
      state.activatedAt = null;
      state.activationStatus = 'idle';
      state.error = null;
    },
    updateLocation: (state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      timestamp: string;
    }>) => {
      state.lastLocation = action.payload;
    },
    setActivationStatus: (state, action: PayloadAction<'idle' | 'pending' | 'success' | 'error'>) => {
      state.activationStatus = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.activationStatus = 'error';
    }
  },
});

export const {
  activate,
  deactivate,
  updateLocation,
  setActivationStatus,
  setError
} = emergencySlice.actions;

// Async thunk for emergency activation
export const activateEmergency = (): AppThunk<boolean> => {
  return async (dispatch) => {
    try {
      dispatch(setActivationStatus('pending'));
      
      // Here you would typically make API calls to your backend
      // For now, we'll simulate a successful activation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(activate());
      return true;
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to activate emergency'));
      return false;
    }
  };
};

export default emergencySlice.reducer; 