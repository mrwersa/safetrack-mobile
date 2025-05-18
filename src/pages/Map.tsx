import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonToggle,
  IonBadge,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonToast,
  IonActionSheet,
  IonLabel,
  IonItem,
  IonList
} from '@ionic/react';
import { 
  locate, informationCircle, layers, walk, car, bicycle, 
  options, ellipsisVertical, map, navigateCircle, warning
} from 'ionicons/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../types';
import { Geolocation, Position, WatchPositionCallback } from '@capacitor/geolocation';
import locationService from '../services/locationService';
import './Map.css';

const Map: React.FC = () => {
  const [mapElement, setMapElement] = useState<HTMLElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [trackingText, setTrackingText] = useState('Start Tracking');
  const [watchId, setWatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<google.maps.LatLng[]>([]);
  const [routePath, setRoutePath] = useState<google.maps.Polyline | null>(null);
  const [showMapActions, setShowMapActions] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Batch location uploads for efficiency
  const locationBatchRef = useRef<Array<{latitude: number; longitude: number; timestamp: string}>>([]);
  const lastUploadRef = useRef<number>(Date.now());
  const UPLOAD_INTERVAL = 60000; // 1 minute
  const BATCH_SIZE = 10;

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBnR3k_cAUtBPHP4s6e0idRPT1l1LdqG-0&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);

  useEffect(() => {
    // Upload location batch when it reaches a certain size or periodically
    const uploadInterval = setInterval(() => {
      if (locationBatchRef.current.length > 0 && 
          (locationBatchRef.current.length >= BATCH_SIZE || 
           Date.now() - lastUploadRef.current >= UPLOAD_INTERVAL)) {
        uploadLocationBatch();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(uploadInterval);
  }, []);

  const uploadLocationBatch = async () => {
    if (!user || locationBatchRef.current.length === 0) return;

    try {
      const batch = [...locationBatchRef.current];
      locationBatchRef.current = [];
      lastUploadRef.current = Date.now();

      await locationService.recordLocationBatch(batch);
      console.log(`Uploaded ${batch.length} locations`);
    } catch (error) {
      console.error('Error uploading location batch', error);
      // Put the locations back in the batch to try again later
      locationBatchRef.current = [...locationBatchRef.current, ...locationBatchRef.current];
    }
  };

  const initMap = async () => {
    const mapEl = document.getElementById('map');
    setMapElement(mapEl);

    if (mapEl && window.google) {
      try {
        // Default location (New York City) if we can't get the user's position
        let latitude = 40.7128;
        let longitude = -74.0060;
        
        try {
          // Try to get current position
          if (navigator.geolocation) {
            // Try Capacitor first
            try {
              const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
              });
              
              setCurrentPosition(position);
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
            } catch (capacitorError) {
              console.log('Using browser geolocation fallback', capacitorError);
              
              // Fallback to browser geolocation
              const browserPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000
                });
              });
              
              // Convert browser position to Capacitor position format
              const position: Position = {
                coords: {
                  latitude: browserPosition.coords.latitude,
                  longitude: browserPosition.coords.longitude,
                  accuracy: browserPosition.coords.accuracy,
                  altitude: browserPosition.coords.altitude,
                  altitudeAccuracy: browserPosition.coords.altitudeAccuracy,
                  heading: browserPosition.coords.heading,
                  speed: browserPosition.coords.speed
                },
                timestamp: browserPosition.timestamp
              };
              
              setCurrentPosition(position);
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
            }
          }
        } catch (geolocationError) {
          console.error('Could not get location, using default', geolocationError);
          // Continue with default location
        }
        
        const latLng = new google.maps.LatLng(latitude, longitude);

        // Create the map
        const mapOptions: google.maps.MapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        };

        const newMap = new google.maps.Map(mapEl, mapOptions);
        setMap(newMap);

        // Add marker for current position
        const marker = new google.maps.Marker({
          position: latLng,
          map: newMap,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });
        setCurrentMarker(marker);

        // Create the polyline for route tracking
        const path = new google.maps.Polyline({
          path: [latLng],
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 3
        });
        path.setMap(newMap);
        setRoutePath(path);
        setRouteCoordinates([latLng]);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map', error);
        setErrorMessage('Failed to initialize map. Please try again.');
        setShowError(true);
        setIsLoading(false);
      }
    }
  };

  const centerMap = async () => {
    if (!map) return;

    try {
      let latitude: number, longitude: number;
      
      try {
        // Try Capacitor geolocation first
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (capacitorError) {
        console.log('Using browser geolocation for centering', capacitorError);
        
        // Fallback to browser geolocation
        const browserPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true
          });
        });
        
        latitude = browserPosition.coords.latitude;
        longitude = browserPosition.coords.longitude;
      }
      
      const latLng = new google.maps.LatLng(latitude, longitude);

      map.panTo(latLng);
      
      if (currentMarker) {
        currentMarker.setPosition(latLng);
      }
    } catch (error) {
      console.error('Error getting current position', error);
      setErrorMessage('Failed to get your current location.');
      setShowError(true);
    }
  };

  const toggleTracking = async () => {
    if (trackingEnabled) {
      // Stop tracking
      if (watchId) {
        // Try to clear with Capacitor first
        try {
          await Geolocation.clearWatch({ id: watchId });
        } catch (error) {
          console.log('Error clearing Capacitor watch', error);
          
          // If it's a browser watchId (number), clear it using the browser API
          if (typeof watchId === 'number' && navigator.geolocation) {
            navigator.geolocation.clearWatch(Number(watchId));
          }
        }
        
        setWatchId(null);
      }
      
      setTrackingEnabled(false);
      setTrackingText('Start Tracking');

      // Upload any remaining locations
      if (locationBatchRef.current.length > 0) {
        await uploadLocationBatch();
      }
    } else {
      // Start tracking
      try {
        let watchIdValue: string | number;
        
        try {
          // Try Capacitor first
          watchIdValue = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 10000 },
            (position) => {
              updateLocation(position);
            }
          );
        } catch (capacitorError) {
          console.log('Using browser geolocation for tracking', capacitorError);
          
          // Fallback to browser geolocation
          if (navigator.geolocation) {
            watchIdValue = navigator.geolocation.watchPosition(
              (browserPosition) => {
                // Convert browser position to Capacitor position format
                const position: Position = {
                  coords: {
                    latitude: browserPosition.coords.latitude,
                    longitude: browserPosition.coords.longitude,
                    accuracy: browserPosition.coords.accuracy,
                    altitude: browserPosition.coords.altitude,
                    altitudeAccuracy: browserPosition.coords.altitudeAccuracy,
                    heading: browserPosition.coords.heading,
                    speed: browserPosition.coords.speed
                  },
                  timestamp: browserPosition.timestamp
                };
                
                updateLocation(position);
              },
              (error) => {
                console.error('Browser geolocation watch error', error);
                setErrorMessage('Failed to track location. Please check your permissions.');
                setShowError(true);
              },
              { enableHighAccuracy: true }
            );
          } else {
            throw new Error('Geolocation not available');
          }
        }
        
        setWatchId(watchIdValue.toString());
        setTrackingEnabled(true);
        setTrackingText('Stop Tracking');
      } catch (error) {
        console.error('Error starting location tracking', error);
        setErrorMessage('Failed to start location tracking. Please check your permissions.');
        setShowError(true);
      }
    }
  };

  const updateLocation = (position: Position | null) => {
    if (!position || !position.coords) return;
    
    const { latitude, longitude } = position.coords;
    const latLng = new google.maps.LatLng(latitude, longitude);
    
    // Update marker position
    if (currentMarker) {
      currentMarker.setPosition(latLng);
    }
    
    // Center map if tracking is enabled
    if (trackingEnabled && map) {
      map.panTo(latLng);
    }
    
    // Update route path
    if (routePath) {
      const path = routePath.getPath();
      path.push(latLng);
    }
    
    // Add to batch for uploading
    locationBatchRef.current.push({
      latitude,
      longitude,
      timestamp: new Date(position.timestamp).toISOString()
    });
    
    // Check if we should upload
    if (locationBatchRef.current.length >= BATCH_SIZE) {
      uploadLocationBatch();
    }
  };

  const clearRoute = () => {
    if (routePath) {
      routePath.setPath([]);
      setRouteCoordinates([]);
    }
  };

  const changeMapType = (mapType: google.maps.MapTypeId) => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  };

  const mapActions = [
    {
      text: 'Standard',
      handler: () => changeMapType(google.maps.MapTypeId.ROADMAP),
      icon: 'map'
    },
    {
      text: 'Satellite',
      handler: () => changeMapType(google.maps.MapTypeId.SATELLITE),
      icon: 'satellite'
    },
    {
      text: 'Hybrid',
      handler: () => changeMapType(google.maps.MapTypeId.HYBRID),
      icon: 'layers'
    },
    {
      text: 'Terrain',
      handler: () => changeMapType(google.maps.MapTypeId.TERRAIN),
      icon: 'mountain'
    }
  ];

  const startTracking = async () => {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        },
        ((position: Position | null) => {
          if (position && position.coords) {
            updateLocation(position);
            setCurrentPosition(position);
          }
        }) as WatchPositionCallback
      );
      setWatchId(watchId);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopTracking = () => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
      setWatchId(null);
    }
  };

  useEffect(() => {
    if (trackingEnabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [trackingEnabled]);

  const getCurrentPosition = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      if (position && position.coords) {
        updateLocation(position);
        setCurrentPosition(position);
      }
    } catch (error) {
      console.error('Error getting current position:', error);
    }
  };

  useEffect(() => {
    if (currentPosition) {
      updateLocation(currentPosition);
    }
  }, [currentPosition]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Location Map</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowMapActions(true)}>
              <IonIcon slot="icon-only" icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="map" className="map-container">
          {isLoading && (
            <div className="map-loading">
              <IonSpinner />
              <p>Loading map...</p>
            </div>
          )}
        </div>
        
        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={toggleTracking} color={trackingEnabled ? 'danger' : 'primary'}>
            <IonIcon icon={trackingEnabled ? warning : walk} />
          </IonFabButton>
        </IonFab>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={centerMap}>
            <IonIcon icon={locate} />
          </IonFabButton>
        </IonFab>
        
        <div className="tracking-panel">
          <div className="tracking-info">
            <IonBadge color={trackingEnabled ? 'success' : 'medium'}>
              {trackingEnabled ? 'Tracking Active' : 'Tracking Inactive'}
            </IonBadge>
            {currentPosition && (
              <div className="coordinates">
                {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
              </div>
            )}
          </div>
          <IonButton 
            size="small" 
            color={trackingEnabled ? 'danger' : 'primary'}
            onClick={toggleTracking}
          >
            {trackingText}
          </IonButton>
        </div>
        
        <IonActionSheet
          isOpen={showMapActions}
          onDidDismiss={() => setShowMapActions(false)}
          header="Map Options"
          buttons={[
            ...mapActions,
            {
              text: 'Clear Route',
              icon: informationCircle,
              role: 'destructive',
              handler: clearRoute
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />
        
        <IonToast
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          message={errorMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Map;