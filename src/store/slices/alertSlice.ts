import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertState } from '../../types';

const initialState: AlertState = {
  message: null,
  type: null,
  isOpen: false
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<{ message: string; type: 'success' | 'warning' | 'danger' | 'info' }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isOpen = true;
    },
    hideAlert: (state) => {
      state.isOpen = false;
    },
    clearAlert: (state) => {
      state.message = null;
      state.type = null;
      state.isOpen = false;
    }
  }
});

export const { showAlert, hideAlert, clearAlert } = alertSlice.actions;
export default alertSlice.reducer;