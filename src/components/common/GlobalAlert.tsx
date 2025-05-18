import React, { useEffect } from 'react';
import { IonAlert } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../types';
import { hideAlert } from '../../store/slices/alertSlice';

const GlobalAlert: React.FC = () => {
  const { message, type, isOpen } = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      // Auto-close alert after 3 seconds
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={() => dispatch(hideAlert())}
      header={type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Alert'}
      message={message || ''}
      buttons={['OK']}
      cssClass={`alert-${type}`}
    />
  );
};

export default GlobalAlert;