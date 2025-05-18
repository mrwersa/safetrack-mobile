import { configureStore, ThunkAction, Action, AnyAction } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import emergencyReducer from './slices/emergencySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emergency: emergencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType>,
  RootState,
  unknown,
  AnyAction
>;