import React, { useState, useEffect } from 'react';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonRippleEffect,
  IonSpinner,
  useIonToast,
  IonText
} from '@ionic/react';
import { warning } from 'ionicons/icons';
import { feedback } from '../utils/feedback';
import { useDispatch, useSelector } from 'react-redux';
import { activateEmergency } from '../store/slices/emergencySlice';
import { RootState } from '../store';
import './PanicButton.css';

interface PanicButtonProps {
  onActivate?: () => void;
  disabled?: boolean;
}

const PanicButton: React.FC<PanicButtonProps> = ({ onActivate, disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [presentToast] = useIonToast();
  const dispatch = useDispatch();
  const emergency = useSelector((state: RootState) => state.emergency);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default behavior to avoid any unwanted effects
    e.preventDefault();
    
    if (disabled || loading) return;

    // If emergency is already active, show feedback and return
    if (emergency.isActive) {
      feedback.emergencyHaptic();
      presentToast({
        message: 'Emergency mode is already active. Help is on the way.',
        duration: 2000,
        position: 'top',
        color: 'danger',
        cssClass: 'emergency-toast'
      });
      return;
    }

    setIsPressed(true);
    feedback.emergencyHaptic();

    // Start timer for long press - 1 second hold time
    const timer = window.setTimeout(async () => {
      setIsPressed(false);
      await handleEmergencyActivation();
    }, 1000) as unknown as number;

    setPressTimer(timer);
  };

  const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleEmergencyActivation = async () => {
    try {
      setLoading(true);
      await feedback.triggerEmergencyFeedback();
      await dispatch(activateEmergency());
      
      if (onActivate) {
        await onActivate();
      }

      await presentToast({
        message: 'Emergency mode activated. Help is on the way.',
        duration: 3000,
        position: 'top',
        color: 'danger',
        cssClass: 'emergency-toast'
      });
    } catch (error) {
      console.error('Error activating emergency:', error);
      await presentToast({
        message: 'Failed to activate emergency mode. Please try again.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonFab
      vertical="bottom"
      horizontal="center"
      slot="fixed"
      className={`panic-button ${isPressed ? 'pressed' : ''} ${loading ? 'loading' : ''} ${emergency.isActive ? 'active' : ''}`}
    >
      <IonFabButton
        color="danger"
        disabled={disabled || loading}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        className="emergency-button"
        aria-label="Emergency SOS Button"
        role="button"
        title={emergency.isActive ? "Emergency mode is active" : "Press and hold to activate emergency mode"}
      >
        {loading ? (
          <IonSpinner name="crescent" />
        ) : (
          <IonIcon icon={warning} size="large" aria-hidden="true" />
        )}
        <IonRippleEffect type="unbounded" />
      </IonFabButton>
      <IonText 
        className="panic-button-label" 
        aria-live="polite"
      >
        {loading ? 'Activating...' : emergency.isActive ? 'Emergency Active' : 'Hold for Emergency'}
      </IonText>
    </IonFab>
  );
};

export default PanicButton; 