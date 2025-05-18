import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonAvatar,
  IonText
} from '@ionic/react';
import {
  home,
  settings,
  people,
  medkit,
  informationCircle,
  logOut,
  person
} from 'ionicons/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import './AppMenu.css';

const AppMenu: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>SafeTrack</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="menu-header">
          <IonAvatar>
            <img
              src={auth.user?.photoURL || '/assets/default-avatar.svg'}
              alt="Profile"
            />
          </IonAvatar>
          <IonText>
            <h2>{auth.user?.displayName || 'User'}</h2>
            <p>{auth.user?.email || ''}</p>
          </IonText>
        </div>

        <IonList>
          <IonMenuToggle auto-hide="false">
            <IonItem routerLink="/home" routerDirection="root" detail={false}>
              <IonIcon slot="start" icon={home} />
              <IonLabel>Home</IonLabel>
            </IonItem>

            <IonItem routerLink="/contacts" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={people} />
              <IonLabel>Emergency Contacts</IonLabel>
            </IonItem>

            <IonItem routerLink="/medical-info" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={medkit} />
              <IonLabel>Medical Information</IonLabel>
            </IonItem>

            <IonItem routerLink="/profile" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonItem>

            <IonItem routerLink="/settings" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={settings} />
              <IonLabel>Settings</IonLabel>
            </IonItem>

            <IonItem routerLink="/about" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={informationCircle} />
              <IonLabel>About</IonLabel>
            </IonItem>

            <IonItem button onClick={() => {/* TODO: Implement logout */}}>
              <IonIcon slot="start" icon={logOut} color="danger" />
              <IonLabel color="danger">Logout</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu; 