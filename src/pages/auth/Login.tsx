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
  IonText,
  IonIcon,
  IonGrid
} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { login, loginWithSocial, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/alertSlice';
import { Link, useHistory } from 'react-router-dom';
import { RootState } from '../../types';
import { logoGoogle, logoFacebook } from 'ionicons/icons';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize social login plugins
    GoogleAuth.initialize();
    FacebookLogin.initialize({ appId: '123456789' }); // Replace with your Facebook App ID
  }, []);

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
    // Show error alert if login fails
    if (error) {
      dispatch(showAlert({ message: error, type: 'danger' }));
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(login({ username, password }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await GoogleAuth.signIn();
      dispatch(loginWithSocial({
        provider: 'google',
        token: response.authentication.accessToken,
        userData: {
          email: response.email,
          name: response.name,
          photoUrl: response.imageUrl
        }
      }));
    } catch (error) {
      console.error('Google login error:', error);
      dispatch(showAlert({
        message: 'Failed to login with Google. Please try again.',
        type: 'danger'
      }));
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await FacebookLogin.login({ permissions: ['email', 'public_profile'] });
      if (result.accessToken) {
        dispatch(loginWithSocial({
          provider: 'facebook',
          token: result.accessToken.token,
          userData: null // Facebook user data will be fetched by the backend
        }));
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      dispatch(showAlert({
        message: 'Failed to login with Facebook. Please try again.',
        type: 'danger'
      }));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>SafeTrack Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Logging in..." />
        
        <div className="login-container">
          <IonCard>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem className={formErrors.username ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Username</IonLabel>
                  <IonInput
                    type="text"
                    value={username}
                    onIonChange={(e) => setUsername(e.detail.value || '')}
                  />
                  {formErrors.username && (
                    <IonText color="danger" className="error-message">
                      {formErrors.username}
                    </IonText>
                  )}
                </IonItem>

                <IonItem className={formErrors.password ? 'ion-invalid' : ''}>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value || '')}
                  />
                  {formErrors.password && (
                    <IonText color="danger" className="error-message">
                      {formErrors.password}
                    </IonText>
                  )}
                </IonItem>

                <IonButton 
                  expand="block" 
                  type="submit" 
                  className="login-button"
                  disabled={isLoading}
                >
                  Login
                </IonButton>
              </form>

              <div className="social-login-divider">
                <span>or continue with</span>
              </div>

              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      color="light"
                      onClick={handleGoogleLogin}
                      className="social-login-button google"
                    >
                      <IonIcon slot="start" icon={logoGoogle} />
                      Google
                    </IonButton>
                  </IonCol>
                  <IonCol>
                    <IonButton
                      expand="block"
                      color="light"
                      onClick={handleFacebookLogin}
                      className="social-login-button facebook"
                    >
                      <IonIcon slot="start" icon={logoFacebook} />
                      Facebook
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          <IonRow className="ion-text-center ion-margin-top">
            <IonCol>
              <Link to="/forgot-password">Forgot Password?</Link>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <Link to="/register">Don't have an account? Register</Link>
            </IonCol>
          </IonRow>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;