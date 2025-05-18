import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  setupIonicReact,
  IonModal,
  IonBackdrop,
  isPlatform,
  IonRouterOutlet
} from '@ionic/react';
import { settings, menu } from 'ionicons/icons';
import { Provider } from 'react-redux';
import { store } from './store';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import ContactsPage from './pages/ContactsPage';
import AppMenu from './components/AppMenu';

/* Components */
import PanicButton from './components/PanicButton';
import EmergencyCard from './components/EmergencyCard';
import QuickActions from './components/QuickActions';

/* Theme */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './App.css';

setupIonicReact({
  mode: 'ios', // Use iOS design system for consistency
});

const App: React.FC = () => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const emergencyCards = [
    {
      type: 'sos' as const,
      title: 'Emergency Mode',
      subtitle: 'Ready to activate',
      description: 'Press and hold the panic button to activate emergency mode.',
      urgent: false
    },
    {
      type: 'guide' as const,
      title: 'First Aid Guide',
      subtitle: 'Quick reference',
      description: 'Access emergency procedures and first aid instructions.',
      actionLabel: 'View Guide'
    },
    {
      type: 'contact' as const,
      title: 'Emergency Contacts',
      subtitle: '3 contacts configured',
      description: 'Your trusted contacts will be notified in case of emergency.',
      actionLabel: 'Manage Contacts'
    }
  ];

  return (
    <Provider store={store}>
      <IonApp>
        <IonReactRouter>
          <AppMenu />
          <IonRouterOutlet id="main">
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/contacts">
              <ContactsPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </Provider>
  );
};

export default App;
