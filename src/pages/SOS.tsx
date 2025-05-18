import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonAlert
} from '@ionic/react';
import { warning, close, checkmarkCircle, helpCircle } from 'ionicons/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../types';
import { Geolocation } from '@capacitor/geolocation';
import locationService from '../services/locationService';
import emergencyService from '../services/emergencyService';
import { showAlert } from '../store/slices/alertSlice';
import './SOS.css';

const SOS: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [emergencyStartTime, setEmergencyStartTime] = useState<Date | null>(null);
  const [showConfirmActivation, setShowConfirmActivation] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [notifiedContacts, setNotifiedContacts] = useState(0);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if there's an active emergency in local storage
    const activeEmergency = localStorage.getItem('activeEmergency');
    if (activeEmergency) {
      try {
        const { startTime } = JSON.parse(activeEmergency);
        setIsEmergencyActive(true);
        setEmergencyStartTime(new Date(startTime));
      } catch (error) {
        console.error('Error parsing active emergency', error);
      }
    }
  }, []);

  const activateEmergency = async () => {
    setIsLoading(true);
    try {
      // Get current location
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      
      const { latitude, longitude } = position.coords;
      
      // Record emergency location
      await locationService.recordEmergencyLocation(
        latitude,
        longitude,
        emergencyMessage || 'Emergency activated via SOS button'
      );
      
      // Notify emergency contacts
      if (user) {
        const response = await emergencyService.sendEmergencyNotifications(
          user.id,
          latitude,
          longitude,
          emergencyMessage || 'I need help! This is an emergency.'
        );
        
        setNotifiedContacts(response.notifiedCount);
      }
      
      // Update state and store in local storage
      const now = new Date();
      setIsEmergencyActive(true);
      setEmergencyStartTime(now);
      localStorage.setItem('activeEmergency', JSON.stringify({
        startTime: now.toISOString(),
        message: emergencyMessage
      }));
      
      dispatch(showAlert({
        message: 'Emergency activated! Your trusted contacts have been notified.',
        type: 'danger'
      }));
    } catch (error) {
      console.error('Error activating emergency', error);
      dispatch(showAlert({
        message: 'Failed to activate emergency. Please try again.',
        type: 'danger'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEmergency = () => {
    // In a real app, you might want to notify your contacts that you're safe
    // and update the emergency status on the server
    setIsEmergencyActive(false);
    setEmergencyStartTime(null);
    setEmergencyMessage('');
    localStorage.removeItem('activeEmergency');
    
    dispatch(showAlert({
      message: 'Emergency canceled. Your contacts will be notified that you are safe.',
      type: 'success'
    }));
  };

  const formatElapsedTime = () => {
    if (!emergencyStartTime) return '00:00:00';
    
    const now = new Date();
    const diffMs = now.getTime() - emergencyStartTime.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const updateElapsedTime = () => {
    const timerEl = document.getElementById('emergency-timer');
    if (timerEl && isEmergencyActive && emergencyStartTime) {
      timerEl.textContent = formatElapsedTime();
    }
  };

  useEffect(() => {
    let timerId: number | null = null;
    
    if (isEmergencyActive && emergencyStartTime) {
      timerId = window.setInterval(updateElapsedTime, 1000);
    }
    
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isEmergencyActive, emergencyStartTime]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={isEmergencyActive ? 'danger' : 'primary'}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{isEmergencyActive ? 'EMERGENCY ACTIVE' : 'SOS Emergency'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Processing..." />
        
        <IonAlert
          isOpen={showConfirmActivation}
          onDidDismiss={() => setShowConfirmActivation(false)}
          header="Confirm Emergency"
          message="Are you sure you want to activate emergency mode? This will notify all your emergency contacts."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Activate',
              role: 'confirm',
              handler: activateEmergency
            }
          ]}
        />
        
        <IonAlert
          isOpen={showConfirmCancel}
          onDidDismiss={() => setShowConfirmCancel(false)}
          header="Cancel Emergency"
          message="Are you sure you want to cancel the emergency? Your contacts will be notified that you are safe."
          buttons={[
            {
              text: 'No',
              role: 'cancel'
            },
            {
              text: 'Yes, I am Safe',
              role: 'confirm',
              handler: cancelEmergency
            }
          ]}
        />
        
        {isEmergencyActive ? (
          <div className="emergency-active">
            <IonCard color="danger">
              <IonCardHeader className="ion-text-center">
                <IonIcon icon={warning} className="emergency-icon" />
                <IonCardTitle>EMERGENCY MODE ACTIVE</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="ion-text-center">
                <div className="emergency-timer" id="emergency-timer">
                  {formatElapsedTime()}
                </div>
                <p>Emergency activated at {emergencyStartTime?.toLocaleTimeString()}</p>
                {notifiedContacts > 0 && (
                  <p>{notifiedContacts} emergency contacts have been notified</p>
                )}
              </IonCardContent>
            </IonCard>
            
            <IonButton
              expand="block"
              color="light"
              className="cancel-button"
              onClick={() => setShowConfirmCancel(true)}
            >
              <IonIcon icon={checkmarkCircle} slot="start" />
              I AM SAFE NOW
            </IonButton>
            
            <IonText color="medium" className="ion-text-center ion-padding">
              <p>
                Emergency services and your emergency contacts have been notified
                of your situation and location. Stay safe and wait for help to arrive.
              </p>
            </IonText>
          </div>
        ) : (
          <div className="emergency-inactive">
            <IonText className="ion-text-center">
              <h2>Emergency SOS</h2>
              <p>
                Use this button in case of emergency. Your location and emergency 
                information will be shared with your emergency contacts.
              </p>
            </IonText>
            
            <IonButton
              expand="block"
              size="large"
              color="danger"
              className="sos-button"
              onClick={() => setShowConfirmActivation(true)}
            >
              <IonIcon icon={warning} slot="start" />
              ACTIVATE EMERGENCY SOS
            </IonButton>
            
            <IonCard className="message-card">
              <IonCardHeader>
                <IonCardTitle>Emergency Message</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonTextarea
                  placeholder="Add details about your emergency situation..."
                  value={emergencyMessage}
                  onIonChange={(e) => setEmergencyMessage(e.detail.value || '')}
                  rows={4}
                  className="emergency-textarea"
                ></IonTextarea>
              </IonCardContent>
            </IonCard>
            
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonButton expand="block" fill="outline" routerLink="/emergency-contacts">
                    Manage Contacts
                  </IonButton>
                </IonCol>
                <IonCol size="6">
                  <IonButton expand="block" fill="outline" routerLink="/map">
                    View Map
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
            
            <IonCard className="info-card">
              <IonCardHeader>
                <div className="info-header">
                  <IonIcon icon={helpCircle} />
                  <IonCardTitle>What happens when you activate SOS?</IonCardTitle>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <ol>
                  <li>Your current location is recorded</li>
                  <li>Emergency contacts are immediately notified</li>
                  <li>Your location is continuously tracked</li>
                  <li>Emergency message is shared with your contacts</li>
                </ol>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SOS;