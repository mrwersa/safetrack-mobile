import React, { useState, useEffect } from 'react';
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
  IonLoading,
  IonCard,
  IonCardContent,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/alertSlice';
import { Link, useHistory } from 'react-router-dom';
import { RootState } from '../../types';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      history.push('/home');
    }
  }, [isAuthenticated, history]);

  useEffect(() => {
    // Show error alert if registration fails
    if (error) {
      dispatch(showAlert({ message: error, type: 'danger' }));
    }
  }, [error, dispatch]);

  const handleChange = (e: CustomEvent, field: string) => {
    const value = e.detail.value || '';
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...registrationData } = formData;
      dispatch(register(registrationData))
        .unwrap()
        .then(() => {
          dispatch(showAlert({
            message: 'Registration successful! Please login.',
            type: 'success'
          }));
          history.push('/login');
        });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>SafeTrack Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Registering..." />
        
        <div className="register-container">
          <IonCard>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem className={formErrors.username ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Username*</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.username}
                    onIonChange={(e) => handleChange(e, 'username')}
                  />
                  {formErrors.username && (
                    <IonText color="danger" className="error-message">
                      {formErrors.username}
                    </IonText>
                  )}
                </IonItem>

                <IonItem className={formErrors.email ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Email*</IonLabel>
                  <IonInput
                    type="email"
                    value={formData.email}
                    onIonChange={(e) => handleChange(e, 'email')}
                  />
                  {formErrors.email && (
                    <IonText color="danger" className="error-message">
                      {formErrors.email}
                    </IonText>
                  )}
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">First Name</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.firstName}
                    onIonChange={(e) => handleChange(e, 'firstName')}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Last Name</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.lastName}
                    onIonChange={(e) => handleChange(e, 'lastName')}
                  />
                </IonItem>

                <IonItem className={formErrors.password ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Password*</IonLabel>
                  <IonInput
                    type="password"
                    value={formData.password}
                    onIonChange={(e) => handleChange(e, 'password')}
                  />
                  {formErrors.password && (
                    <IonText color="danger" className="error-message">
                      {formErrors.password}
                    </IonText>
                  )}
                </IonItem>

                <IonItem className={formErrors.confirmPassword ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Confirm Password*</IonLabel>
                  <IonInput
                    type="password"
                    value={formData.confirmPassword}
                    onIonChange={(e) => handleChange(e, 'confirmPassword')}
                  />
                  {formErrors.confirmPassword && (
                    <IonText color="danger" className="error-message">
                      {formErrors.confirmPassword}
                    </IonText>
                  )}
                </IonItem>

                <IonButton 
                  expand="block" 
                  type="submit" 
                  className="register-button"
                  disabled={isLoading}
                >
                  Register
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          <IonRow className="ion-text-center ion-margin-top">
            <IonCol>
              <Link to="/login">Already have an account? Login</Link>
            </IonCol>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;