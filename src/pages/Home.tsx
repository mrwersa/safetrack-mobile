import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  IonModal,
  IonMenuButton,
  IonAvatar,
  IonText,
  IonBadge,
  IonSkeletonText,
  useIonAlert
} from '@ionic/react';
import {
  settings,
  notifications,
  chevronUp
} from 'ionicons/icons';
import PanicButton from '../components/PanicButton';
import StatusCard from '../components/StatusCard';
import QuickActions from '../components/QuickActions';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import './Home.css';

const Home: React.FC = () => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAlert] = useIonAlert();
  const emergency = useSelector((state: RootState) => state.emergency);
  const auth = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyActivation = () => {
    showAlert({
      header: 'Emergency Mode Activated',
      message: 'Your emergency contacts will be notified and your location will be shared.',
      buttons: ['OK']
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <div className="header-content">
            <div className="user-info">
              <IonAvatar>
                {isLoading ? (
                  <IonSkeletonText animated />
                ) : (
                  <img
                    src={auth.user?.photoURL || '/assets/default-avatar.svg'}
                    alt="Profile"
                  />
                )}
              </IonAvatar>
              <div className="user-details">
                <IonTitle size="small">
                  {isLoading ? (
                    <IonSkeletonText animated style={{ width: '150px' }} />
                  ) : (
                    auth.user?.name || 'Guest User'
                  )}
                </IonTitle>
                <IonText color="medium">
                  {isLoading ? (
                    <IonSkeletonText animated style={{ width: '100px' }} />
                  ) : (
                    'SafeTrack User'
                  )}
                </IonText>
              </div>
            </div>
            <IonButtons slot="end">
              <IonButton routerLink="/notifications">
                <IonIcon slot="icon-only" icon={notifications} />
                {emergency.isActive && <IonBadge color="danger">1</IonBadge>}
              </IonButton>
              <IonButton routerLink="/settings">
                <IonIcon slot="icon-only" icon={settings} />
              </IonButton>
            </IonButtons>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <StatusCard
          isLoading={isLoading}
          lastLocation={null}
          isMonitoring={true}
        />

        <PanicButton onActivate={handleEmergencyActivation} />
      </IonContent>

      <IonFooter className="ion-no-border">
        <div 
          className="quick-actions-pull-tab"
          onClick={() => setShowQuickActions(true)}
        >
          <div className="pull-indicator" />
          <IonIcon icon={chevronUp} />
          <span>Quick Actions</span>
        </div>
      </IonFooter>

      <IonModal
        isOpen={showQuickActions}
        breakpoints={[0, 0.5, 0.75]}
        initialBreakpoint={0.5}
        onDidDismiss={() => setShowQuickActions(false)}
        className="quick-actions-modal"
      >
        <QuickActions />
      </IonModal>
    </IonPage>
  );
};

export default Home;
