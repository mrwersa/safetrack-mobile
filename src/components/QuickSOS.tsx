import React, { useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonRippleEffect,
  useIonAlert,
  useIonToast,
  isPlatform
} from '@ionic/react';
import { warning, alertCircle } from 'ionicons/icons';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useDispatch } from 'react-redux';
import './QuickSOS.css';

const QuickSOS: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const dispatch = useDispatch();

  const triggerHapticFeedback = async () => {
    if (isPlatform('hybrid')) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } else if (navigator.vibrate) {
      // Use Web Vibration API for browsers that support it
      navigator.vibrate(200);
    }
  };

  const handlePressStart = async () => {
    setIsPressed(true);
    await triggerHapticFeedback();
    
    const timer = setTimeout(async () => {
      await triggerSOS();
    }, 3000); // 3 seconds press to activate
    
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const activateEmergencyMode = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await emergencyService.activate();
      
      if (isPlatform('hybrid')) {
        try {
          await Haptics.notification({ type: NotificationType.Success });
        } catch (error) {
          console.log('Haptics not available:', error);
        }
      }

      // Dispatch emergency activation to Redux store
      dispatch({ type: 'emergency/activate' });

      presentToast({
        message: 'Emergency mode activated',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });

      // TODO: Start location tracking
      // TODO: Send notifications to emergency contacts
    } catch (error) {
      console.error('Failed to activate emergency mode:', error);
      presentToast({
        message: 'Failed to activate emergency mode',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
    }
  };

  const triggerSOS = async () => {
    if (isPlatform('hybrid')) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    presentAlert({
      header: 'Emergency Mode',
      message: 'Are you sure you want to activate emergency mode?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            presentToast({
              message: 'Emergency mode cancelled',
              duration: 2000,
              position: 'bottom',
              color: 'medium'
            });
          }
        },
        {
          text: 'Activate',
          role: 'confirm',
          handler: activateEmergencyMode
        }
      ]
    });
  };

  const handleClick = () => {
    if (!isPlatform('hybrid')) {
      // For browser testing, trigger SOS immediately without hold
      triggerSOS();
    }
  };

  return (
    <div className={`quick-sos ${isPressed ? 'pressed' : ''}`}>
      <IonButton
        className="sos-button ion-activatable"
        expand="block"
        color="danger"
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={isPlatform('hybrid') ? handlePressStart : undefined}
        onMouseUp={isPlatform('hybrid') ? handlePressEnd : undefined}
        onMouseLeave={isPlatform('hybrid') ? handlePressEnd : undefined}
        onClick={handleClick}
      >
        <IonIcon icon={isPressed ? alertCircle : warning} slot="start" />
        {isPressed ? 'Hold to Activate' : 'SOS Emergency'}
        <IonRippleEffect type="unbounded" />
      </IonButton>
      {isPressed && (
        <div className="activation-indicator">
          <div className="progress-ring" />
        </div>
      )}
    </div>
  );
};

export default QuickSOS; 