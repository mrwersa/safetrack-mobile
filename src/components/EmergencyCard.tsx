import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonRippleEffect
} from '@ionic/react';
import { warning, call, location, people, information } from 'ionicons/icons';
import './EmergencyCard.css';

interface EmergencyCardProps {
  type: 'sos' | 'guide' | 'contact' | 'location';
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  urgent?: boolean;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({
  type,
  title,
  subtitle,
  description,
  actionLabel,
  onAction,
  urgent = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'sos':
        return warning;
      case 'guide':
        return information;
      case 'contact':
        return people;
      case 'location':
        return location;
      default:
        return warning;
    }
  };

  return (
    <IonCard 
      className={`emergency-card ${type} ${urgent ? 'urgent' : ''}`}
      button={!!onAction}
      onClick={onAction}
    >
      <div className="ion-activatable ripple-parent">
        <IonRippleEffect />
      </div>
      <IonCardHeader>
        <div className="card-header-content">
          <div className="icon-container">
            <IonIcon icon={getIcon()} size="large" aria-hidden="true" />
          </div>
          <div className="text-container">
            <IonCardTitle>{title}</IonCardTitle>
            {subtitle && <IonCardSubtitle>{subtitle}</IonCardSubtitle>}
          </div>
        </div>
      </IonCardHeader>

      {description && (
        <IonCardContent>
          <p>{description}</p>
        </IonCardContent>
      )}

      {actionLabel && onAction && (
        <div className="card-actions">
          <IonButton 
            fill="clear" 
            expand="block"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            {type === 'contact' && <IonIcon icon={call} slot="start" />}
            {actionLabel}
          </IonButton>
        </div>
      )}
    </IonCard>
  );
};

export default EmergencyCard; 