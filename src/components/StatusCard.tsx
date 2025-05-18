import React, { useEffect, useState, useCallback } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonBadge,
  IonSkeletonText,
  IonChip,
  isPlatform,
  useIonToast,
  IonSpinner,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel
} from '@ionic/react';
import {
  location,
  time,
  wifi,
  batteryFull,
  batteryHalf,
  batteryDead,
  shield,
  pulse,
  warning,
  alertCircle,
  medkit,
  people,
  home
} from 'ionicons/icons';
import { Position } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import locationService from '../services/locationService';
import './StatusCard.css';

interface StatusCardProps {
  lastLocation: Position | null;
  isLoading: boolean;
  batteryLevel?: number;
  isOnline?: boolean;
  isMonitoring?: boolean;
}

interface DeviceCapabilities {
  hasBattery: boolean;
  hasNetwork: boolean;
  hasVibration: boolean;
  hasGeolocation: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  lastLocation,
  isLoading,
  batteryLevel: propBatteryLevel,
  isOnline: propIsOnline,
  isMonitoring = true
}) => {
  const [batteryLevel, setBatteryLevel] = useState(propBatteryLevel ?? 100);
  const [isOnline, setIsOnline] = useState(propIsOnline ?? true);
  const [address, setAddress] = useState<any>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasBattery: false,
    hasNetwork: false,
    hasVibration: false,
    hasGeolocation: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [presentToast] = useIonToast();
  const emergency = useSelector((state: RootState) => state.emergency);

  useEffect(() => {
    if (lastLocation?.coords) {
      locationService.getAddressFromCoordinates(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude
      ).then(addressData => {
        setAddress(addressData);
      }).catch(error => {
        console.error('Error getting address:', error);
      });
    }
  }, [lastLocation]);

  const detectCapabilities = useCallback(async () => {
    const caps: DeviceCapabilities = {
      hasBattery: isPlatform('hybrid') || ('getBattery' in navigator),
      hasNetwork: isPlatform('hybrid') || navigator.onLine !== undefined,
      hasVibration: 'vibrate' in navigator,
      hasGeolocation: 'geolocation' in navigator,
    };
    setCapabilities(caps);
  }, []);

  useEffect(() => {
    detectCapabilities();
    initializeDeviceMonitoring();

    return () => {
      // Cleanup network listeners if needed
      if (isPlatform('hybrid')) {
        Network.removeAllListeners();
      }
    };
  }, [detectCapabilities]);

  const initializeDeviceMonitoring = async () => {
    try {
      if (isPlatform('hybrid')) {
        // Device battery monitoring
        const info = await Device.getBatteryInfo();
        if (info.batteryLevel !== undefined) {
          setBatteryLevel(Math.round(info.batteryLevel * 100));
        }

        // Network monitoring for mobile
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        
        Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected);
          presentToast({
            message: status.connected ? 'Network connected' : 'Network disconnected',
            duration: 2000,
            position: 'bottom',
            color: status.connected ? 'success' : 'warning'
          });
        });
      } else {
        // Browser implementations
        if (navigator.getBattery) {
          const battery = await navigator.getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        }

        // Browser network status
        setIsOnline(navigator.onLine);
        window.addEventListener('online', () => {
          setIsOnline(true);
          presentToast({
            message: 'Network connected',
            duration: 2000,
            position: 'bottom',
            color: 'success'
          });
        });
        window.addEventListener('offline', () => {
          setIsOnline(false);
          presentToast({
            message: 'Network disconnected',
            duration: 2000,
            position: 'bottom',
            color: 'warning'
          });
        });
      }
    } catch (error) {
      console.error('Error initializing device monitoring:', error);
      setError('Failed to initialize device monitoring');
    }
  };

  const formatLocation = (position: Position | null) => {
    if (!position) return 'Unknown';
    const lat = position.coords.latitude.toFixed(6);
    const lng = position.coords.longitude.toFixed(6);
    return `${lat}, ${lng}`;
  };

  const formatTime = (position: Position | null) => {
    if (!position) return 'Unknown';
    return new Date(position.timestamp).toLocaleTimeString();
  };

  const getBatteryIcon = (level: number) => {
    if (level > 50) return batteryFull;
    if (level > 20) return batteryHalf;
    return batteryDead;
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'success';
    if (level > 20) return 'warning';
    return 'danger';
  };

  const getEmergencyStatus = () => {
    if (emergency.isActive) {
      return {
        text: 'EMERGENCY ACTIVE',
        subtext: 'Help is on the way',
        color: 'danger',
        icon: alertCircle,
        timestamp: emergency.activatedAt
      };
    }
    if (isMonitoring) {
      return {
        text: 'Protected',
        subtext: 'SafeTrack is monitoring',
        color: 'success',
        icon: shield,
        timestamp: null
      };
    }
    return {
      text: 'Inactive',
      subtext: 'Protection disabled',
      color: 'medium',
      icon: pulse,
      timestamp: null
    };
  };

  const status = getEmergencyStatus();

  return (
    <IonCard className={`status-card ${emergency.isActive ? 'emergency-active' : ''}`}>
      <IonCardHeader>
        <IonCardTitle className="status-title">
          <span>System Status</span>
          <IonChip color={status.color} className="status-chip">
            <IonIcon icon={status.icon} />
            <IonText>{status.text}</IonText>
          </IonChip>
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {error ? (
          <div className="error-message">
            <IonIcon icon={warning} color="danger" />
            <p>{error}</p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <div className="status-item">
                  <IonIcon icon={medkit} color={status.color} />
                  <div className="status-text">
                    <strong>{status.subtext}</strong>
                    {status.timestamp && (
                      <small>Activated: {new Date(status.timestamp).toLocaleString()}</small>
                    )}
                  </div>
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="6">
                <div className="status-item">
                  <IonIcon
                    icon={getBatteryIcon(batteryLevel)}
                    color={getBatteryColor(batteryLevel)}
                  />
                  <div className="status-text">
                    <strong>Battery</strong>
                    <small>{isLoading ? <IonSkeletonText animated /> : `${batteryLevel}%`}</small>
                  </div>
                </div>
              </IonCol>

              <IonCol size="6">
                <div className="status-item">
                  <IonIcon icon={wifi} color={isOnline ? 'success' : 'danger'} />
                  <div className="status-text">
                    <strong>Network</strong>
                    <small>{isOnline ? 'Connected' : 'Offline'}</small>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <div className="status-item">
                  <IonIcon icon={location} color={lastLocation ? 'success' : 'warning'} />
                  <div className="status-text">
                    <strong>Location</strong>
                    <small>
                      {isLoading ? (
                        <IonSkeletonText animated />
                      ) : lastLocation && lastLocation.coords ? (
                        <>
                          <IonItem lines="none">
                            <IonIcon icon={location} slot="start" color="primary" />
                            <IonLabel>
                              <h2>Current Location</h2>
                              <p>
                                {lastLocation.coords.latitude.toFixed(6)}, {lastLocation.coords.longitude.toFixed(6)}
                              </p>
                              {address && (
                                <p>
                                  <IonIcon icon={home} className="address-icon" />
                                  {address.formattedAddress}
                                </p>
                              )}
                            </IonLabel>
                          </IonItem>
                          
                          {lastLocation.coords.accuracy && (
                            <IonChip color="primary" className="accuracy-chip">
                              <IonIcon icon={pulse} />
                              <IonLabel>Accuracy: ±{Math.round(lastLocation.coords.accuracy)}m</IonLabel>
                            </IonChip>
                          )}
                        </>
                      ) : (
                        <IonText color="medium">
                          <p>Location not available</p>
                        </IonText>
                      )}
                    </small>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            {emergency.isActive && (
              <IonRow>
                <IonCol size="12">
                  <div className="status-item emergency-contacts">
                    <IonIcon icon={people} color="primary" />
                    <div className="status-text">
                      <strong>Emergency Contacts Notified</strong>
                      <small>Help is being coordinated</small>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default StatusCard; 