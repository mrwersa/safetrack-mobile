import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonAlert,
  IonLoading
} from '@ionic/react';
import {
  logOut,
  lockClosed,
  notifications,
  map,
  settings,
  informationCircle,
  person,
  helpCircle,
  shield,
  timeOutline,
  batteryHalf
} from 'ionicons/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/alertSlice';
import './Profile.css';

const Profile: React.FC = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    lowBatteryAlert: true,
    inactivityTime: '30',
    notificationsEnabled: true
  });
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      history.push('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      console.error('Logout error:', errorMessage);
      dispatch(showAlert({
        message: 'Failed to logout. Please try again.',
        type: 'danger'
      }));
    }
  };

  const handleToggleChange = (field: string, checked: boolean) => {
    setSettings({
      ...settings,
      [field]: checked
    });
  };

  const handleInputChange = (e: CustomEvent, field: string) => {
    const value = e.detail.value;
    setSettings({
      ...settings,
      [field]: value
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Profile & Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Processing..." />
        
        <IonAlert
          isOpen={showLogoutConfirm}
          onDidDismiss={() => setShowLogoutConfirm(false)}
          header="Log Out"
          message="Are you sure you want to log out of SafeTrack?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Log Out',
              handler: handleLogout
            }
          ]}
        />
        
        <div className="profile-header">
          <IonAvatar className="profile-avatar">
            <img src={user?.photoURL || '/assets/default-avatar.svg'} alt="Profile" />
          </IonAvatar>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p>{user?.email}</p>
        </div>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Account Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem detail routerLink="/profile/edit">
                <IonIcon icon={person} slot="start" color="primary" />
                <IonLabel>Edit Profile</IonLabel>
              </IonItem>
              <IonItem detail routerLink="/profile/password">
                <IonIcon icon={lockClosed} slot="start" color="primary" />
                <IonLabel>Change Password</IonLabel>
              </IonItem>
              <IonItem detail routerLink="/emergency-contacts">
                <IonIcon icon={person} slot="start" color="primary" />
                <IonLabel>Manage Emergency Contacts</IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Safety Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonIcon icon={map} slot="start" color="secondary" />
                <IonLabel>Location Tracking</IonLabel>
                <IonToggle
                  checked={settings.trackingEnabled}
                  onIonChange={(e) => handleToggleChange('trackingEnabled', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonIcon icon={timeOutline} slot="start" color="secondary" />
                <IonLabel>Inactivity Alert (minutes)</IonLabel>
                <IonInput
                  type="number"
                  value={settings.inactivityTime}
                  onIonChange={(e) => handleInputChange(e, 'inactivityTime')}
                />
              </IonItem>
              
              <IonItem>
                <IonIcon icon={batteryHalf} slot="start" color="secondary" />
                <IonLabel>Low Battery Alert</IonLabel>
                <IonToggle
                  checked={settings.lowBatteryAlert}
                  onIonChange={(e) => handleToggleChange('lowBatteryAlert', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonIcon icon={notifications} slot="start" color="secondary" />
                <IonLabel>Push Notifications</IonLabel>
                <IonToggle
                  checked={settings.notificationsEnabled}
                  onIonChange={(e) => handleToggleChange('notificationsEnabled', e.detail.checked)}
                />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>App Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem detail routerLink="/help">
                <IonIcon icon={helpCircle} slot="start" color="tertiary" />
                <IonLabel>Help & Support</IonLabel>
              </IonItem>
              <IonItem detail routerLink="/privacy">
                <IonIcon icon={shield} slot="start" color="tertiary" />
                <IonLabel>Privacy Policy</IonLabel>
              </IonItem>
              <IonItem detail routerLink="/about">
                <IonIcon icon={informationCircle} slot="start" color="tertiary" />
                <IonLabel>About SafeTrack</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <div className="version-info">
                    <p>Version 1.0.0</p>
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        
        <div className="logout-button-container">
          <IonButton
            expand="block"
            color="danger"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <IonIcon slot="start" icon={logOut} />
            Log Out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;