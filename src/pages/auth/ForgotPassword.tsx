import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showAlert } from '../../store/slices/alertSlice';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const validateForm = (): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // This is just a placeholder. In a real app, you would call an API endpoint
      // to initiate the password reset process.
      console.log('Password reset requested for:', email);
      
      setIsSubmitted(true);
      dispatch(showAlert({
        message: 'If an account exists with this email, password reset instructions will be sent.',
        type: 'info'
      }));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Reset Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <IonCard>
            <IonCardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <p>
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  
                  <IonItem className={error ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput
                      type="email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value || '')}
                    />
                    {error && (
                      <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '1rem' }}>
                        {error}
                      </IonText>
                    )}
                  </IonItem>

                  <IonButton 
                    expand="block" 
                    type="submit" 
                    style={{ marginTop: '1.5rem' }}
                  >
                    Send Reset Instructions
                  </IonButton>
                </form>
              ) : (
                <div className="ion-text-center">
                  <h2>Check Your Email</h2>
                  <p>
                    If an account exists with the email {email}, we've sent instructions
                    to reset your password.
                  </p>
                  <p>
                    Please check your email inbox and follow the instructions.
                  </p>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          <IonRow className="ion-text-center ion-margin-top">
            <IonCol>
              <Link to="/login">Back to Login</Link>
            </IonCol>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;