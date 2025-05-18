import React from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRippleEffect,
  IonText
} from '@ionic/react';
import {
  call,
  medkit,
  location,
  flashlight,
  volumeHigh,
  wifi,
  batteryFull
} from 'ionicons/icons';
import './QuickActions.css';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  action: () => void;
  disabled?: boolean;
  status?: 'active' | 'inactive' | 'warning';
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'emergency-call',
    icon: call,
    label: 'Emergency Call',
    description: 'Call local emergency services',
    action: () => console.log('Emergency call'),
    status: 'active'
  },
  {
    id: 'first-aid',
    icon: medkit,
    label: 'First Aid Guide',
    description: 'Quick access to first aid instructions',
    action: () => console.log('First aid guide')
  },
  {
    id: 'share-location',
    icon: location,
    label: 'Share Location',
    description: 'Send your current location to contacts',
    action: () => console.log('Share location')
  },
  {
    id: 'flashlight',
    icon: flashlight,
    label: 'Flashlight',
    description: 'Toggle device flashlight',
    action: () => console.log('Toggle flashlight')
  },
  {
    id: 'sound-alarm',
    icon: volumeHigh,
    label: 'Sound Alarm',
    description: 'Activate loud emergency alarm',
    action: () => console.log('Sound alarm')
  }
];

const QuickActions: React.FC<QuickActionsProps> = ({ actions = defaultActions }) => {
  return (
    <div className="quick-actions">
      <div className="quick-actions-header">
        <IonText color="medium">
          <h2>Quick Actions</h2>
        </IonText>
      </div>
      
      <IonList lines="full">
        {actions.map((action) => (
          <IonItem
            key={action.id}
            button
            detail={false}
            onClick={() => !action.disabled && action.action()}
            disabled={action.disabled}
            className={`quick-action-item ${action.status || ''}`}
          >
            <div className="ion-activatable ripple-parent">
              <IonRippleEffect />
            </div>
            
            <div className="quick-action-icon">
              <IonIcon
                icon={action.icon}
                size="small"
                color={action.disabled ? 'medium' : 'primary'}
                aria-hidden="true"
              />
            </div>
            
            <IonLabel>
              <h3>{action.label}</h3>
              <p>{action.description}</p>
            </IonLabel>

            {action.status && (
              <div className={`status-indicator ${action.status}`}>
                <div className="status-dot" />
              </div>
            )}
          </IonItem>
        ))}
      </IonList>

      <div className="quick-actions-footer">
        <div className="status-row">
          <div className="status-item">
            <IonIcon icon={wifi} color="success" />
            <span>Online</span>
          </div>
          <div className="status-item">
            <IonIcon icon={batteryFull} color="success" />
            <span>Battery 85%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 