import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonModal,
  IonButtons,
  IonBackButton,
  IonInput,
  IonText,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonLoading,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonAlert
} from '@ionic/react';
import { 
  add, mail, call, personCircle, informationCircle, 
  chevronForward, checkmarkCircle, closeCircle, time, 
  trash, create
} from 'ionicons/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../types';
import { EmergencyContact, EmergencyContactStatus } from '../types';
import emergencyService from '../services/emergencyService';
import { showAlert } from '../store/slices/alertSlice';

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [currentContact, setCurrentContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    notifySos: true,
    notifyGeofence: false,
    notifyInactivity: false,
    notifyLowBattery: false,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await emergencyService.getEmergencyContacts(user.id);
      setContacts(response.content);
    } catch (error) {
      console.error('Error loading contacts', error);
      dispatch(showAlert({
        message: 'Failed to load emergency contacts',
        type: 'danger'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: CustomEvent, field: string) => {
    const value = e.detail.value;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleToggleChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      notifySos: true,
      notifyGeofence: false,
      notifyInactivity: false,
      notifyLowBattery: false,
      notes: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      relationship: contact.relationship || '',
      notifySos: contact.notifySos,
      notifyGeofence: contact.notifyGeofence,
      notifyInactivity: contact.notifyInactivity,
      notifyLowBattery: contact.notifyLowBattery,
      notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const confirmDelete = (contact: EmergencyContact) => {
    setCurrentContact(contact);
    setShowDeleteAlert(true);
  };

  const validateForm = (isEditMode: boolean): boolean => {
    const errors: Record<string, string> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!isEditMode && !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (formData.email && !emailPattern.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (isEditMode: boolean) => {
    if (!user) return;
    
    if (!validateForm(isEditMode)) {
      return;
    }
    
    setIsLoading(true);
    try {
      if (isEditMode && currentContact) {
        // Update existing contact
        await emergencyService.updateEmergencyContact(currentContact.id, {
          name: formData.name,
          phone: formData.phone,
          relationship: formData.relationship,
          notifySos: formData.notifySos,
          notifyGeofence: formData.notifyGeofence,
          notifyInactivity: formData.notifyInactivity,
          notifyLowBattery: formData.notifyLowBattery,
          notes: formData.notes
        });
        
        dispatch(showAlert({
          message: 'Emergency contact updated successfully',
          type: 'success'
        }));
        
        setShowEditModal(false);
      } else {
        // Add new contact
        await emergencyService.addEmergencyContact(user.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          relationship: formData.relationship,
          notifySos: formData.notifySos,
          notifyGeofence: formData.notifyGeofence,
          notifyInactivity: formData.notifyInactivity,
          notifyLowBattery: formData.notifyLowBattery,
          notes: formData.notes
        });
        
        dispatch(showAlert({
          message: 'Emergency contact added successfully',
          type: 'success'
        }));
        
        setShowAddModal(false);
      }
      
      // Reload contacts
      await loadContacts();
    } catch (error) {
      console.error('Error saving contact', error);
      dispatch(showAlert({
        message: `Failed to ${isEditMode ? 'update' : 'add'} emergency contact`,
        type: 'danger'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = async () => {
    if (!currentContact) return;
    
    setIsLoading(true);
    try {
      await emergencyService.removeEmergencyContact(currentContact.id);
      
      dispatch(showAlert({
        message: 'Emergency contact removed successfully',
        type: 'success'
      }));
      
      // Remove from local state
      setContacts(contacts.filter(c => c.id !== currentContact.id));
    } catch (error) {
      console.error('Error deleting contact', error);
      dispatch(showAlert({
        message: 'Failed to remove emergency contact',
        type: 'danger'
      }));
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const resendVerification = async (contactId: string) => {
    setIsLoading(true);
    try {
      await emergencyService.resendVerification(contactId);
      
      dispatch(showAlert({
        message: 'Verification email resent successfully',
        type: 'success'
      }));
    } catch (error) {
      console.error('Error resending verification', error);
      dispatch(showAlert({
        message: 'Failed to resend verification email',
        type: 'danger'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: EmergencyContactStatus) => {
    switch (status) {
      case EmergencyContactStatus.ACTIVE:
        return <IonBadge color="success">Active</IonBadge>;
      case EmergencyContactStatus.PENDING:
        return <IonBadge color="warning">Pending</IonBadge>;
      case EmergencyContactStatus.DECLINED:
        return <IonBadge color="danger">Declined</IonBadge>;
      case EmergencyContactStatus.REVOKED:
        return <IonBadge color="medium">Revoked</IonBadge>;
      case EmergencyContactStatus.EXPIRED:
        return <IonBadge color="light">Expired</IonBadge>;
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Emergency Contacts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={isLoading} message="Loading..." />
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Remove Contact"
          message={`Are you sure you want to remove ${currentContact?.name} from your emergency contacts?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Remove',
              role: 'destructive',
              handler: deleteContact
            }
          ]}
        />
        
        <div className="ion-padding-horizontal">
          <h4>Your Trusted Contacts</h4>
          <p>
            These people will be notified in case of emergency and can help you
            when you need assistance.
          </p>
        </div>
        
        {isLoading && contacts.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
            <p>Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonIcon
              icon={personCircle}
              style={{ fontSize: '4rem', color: 'var(--ion-color-medium)' }}
            />
            <p>You don't have any emergency contacts yet.</p>
            <IonButton onClick={openAddModal}>
              <IonIcon slot="start" icon={add} />
              Add Your First Contact
            </IonButton>
          </div>
        ) : (
          <IonList>
            {contacts.map((contact) => (
              <IonItemSliding key={contact.id}>
                <IonItem detail>
                  <IonLabel>
                    <h2>{contact.name}</h2>
                    <p>
                      {contact.email}
                      {contact.phone && ` " ${contact.phone}`}
                    </p>
                    <p>
                      {getStatusBadge(contact.status)}
                      {contact.relationship && (
                        <span className="ion-margin-start">{contact.relationship}</span>
                      )}
                    </p>
                  </IonLabel>
                  {contact.status === EmergencyContactStatus.PENDING && (
                    <IonButton
                      fill="clear"
                      slot="end"
                      onClick={() => resendVerification(contact.id)}
                    >
                      <IonIcon icon={mail} slot="icon-only" />
                    </IonButton>
                  )}
                </IonItem>
                
                <IonItemOptions side="end">
                  <IonItemOption onClick={() => openEditModal(contact)}>
                    <IonIcon slot="icon-only" icon={create} />
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => confirmDelete(contact)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={openAddModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        
        {/* Add Contact Modal */}
        <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add Emergency Contact</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
              <IonItem className={formErrors.name ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">Name*</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonChange={(e) => handleChange(e, 'name')}
                  placeholder="Full name"
                />
                {formErrors.name && (
                  <IonText color="danger" className="ion-padding-start">
                    <small>{formErrors.name}</small>
                  </IonText>
                )}
              </IonItem>
              
              <IonItem className={formErrors.email ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">Email*</IonLabel>
                <IonInput
                  type="email"
                  value={formData.email}
                  onIonChange={(e) => handleChange(e, 'email')}
                  placeholder="email@example.com"
                />
                {formErrors.email && (
                  <IonText color="danger" className="ion-padding-start">
                    <small>{formErrors.email}</small>
                  </IonText>
                )}
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Phone</IonLabel>
                <IonInput
                  type="tel"
                  value={formData.phone}
                  onIonChange={(e) => handleChange(e, 'phone')}
                  placeholder="(555) 555-5555"
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Relationship</IonLabel>
                <IonSelect
                  value={formData.relationship}
                  onIonChange={(e) => handleChange(e, 'relationship')}
                  placeholder="Select relationship"
                >
                  <IonSelectOption value="Family">Family</IonSelectOption>
                  <IonSelectOption value="Friend">Friend</IonSelectOption>
                  <IonSelectOption value="Partner">Partner</IonSelectOption>
                  <IonSelectOption value="Colleague">Colleague</IonSelectOption>
                  <IonSelectOption value="Other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>
              
              <IonItem className="notification-toggle">
                <IonLabel>Notify for SOS</IonLabel>
                <IonToggle
                  checked={formData.notifySos}
                  onIonChange={(e) => handleToggleChange('notifySos', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem className="notification-toggle">
                <IonLabel>Notify for Geofence Alerts</IonLabel>
                <IonToggle
                  checked={formData.notifyGeofence}
                  onIonChange={(e) => handleToggleChange('notifyGeofence', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem className="notification-toggle">
                <IonLabel>Notify for Inactivity</IonLabel>
                <IonToggle
                  checked={formData.notifyInactivity}
                  onIonChange={(e) => handleToggleChange('notifyInactivity', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem className="notification-toggle">
                <IonLabel>Notify for Low Battery</IonLabel>
                <IonToggle
                  checked={formData.notifyLowBattery}
                  onIonChange={(e) => handleToggleChange('notifyLowBattery', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Notes</IonLabel>
                <IonInput
                  value={formData.notes}
                  onIonChange={(e) => handleChange(e, 'notes')}
                  placeholder="Additional information about this contact"
                />
              </IonItem>
              
              <div className="ion-padding">
                <IonButton expand="block" type="submit">
                  Add Contact
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>
        
        {/* Edit Contact Modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Emergency Contact</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }}>
              <IonItem className={formErrors.name ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">Name*</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonChange={(e) => handleChange(e, 'name')}
                />
                {formErrors.name && (
                  <IonText color="danger" className="ion-padding-start">
                    <small>{formErrors.name}</small>
                  </IonText>
                )}
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  value={formData.email}
                  disabled
                />
                <IonText color="medium" className="ion-padding-start ion-padding-top">
                  <small>Email cannot be changed</small>
                </IonText>
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Phone</IonLabel>
                <IonInput
                  type="tel"
                  value={formData.phone}
                  onIonChange={(e) => handleChange(e, 'phone')}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Relationship</IonLabel>
                <IonSelect
                  value={formData.relationship}
                  onIonChange={(e) => handleChange(e, 'relationship')}
                >
                  <IonSelectOption value="Family">Family</IonSelectOption>
                  <IonSelectOption value="Friend">Friend</IonSelectOption>
                  <IonSelectOption value="Partner">Partner</IonSelectOption>
                  <IonSelectOption value="Colleague">Colleague</IonSelectOption>
                  <IonSelectOption value="Other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>
              
              <IonItem>
                <IonLabel>Notify for SOS</IonLabel>
                <IonToggle
                  checked={formData.notifySos}
                  onIonChange={(e) => handleToggleChange('notifySos', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>Notify for Geofence Alerts</IonLabel>
                <IonToggle
                  checked={formData.notifyGeofence}
                  onIonChange={(e) => handleToggleChange('notifyGeofence', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>Notify for Inactivity</IonLabel>
                <IonToggle
                  checked={formData.notifyInactivity}
                  onIonChange={(e) => handleToggleChange('notifyInactivity', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel>Notify for Low Battery</IonLabel>
                <IonToggle
                  checked={formData.notifyLowBattery}
                  onIonChange={(e) => handleToggleChange('notifyLowBattery', e.detail.checked)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Notes</IonLabel>
                <IonInput
                  value={formData.notes}
                  onIonChange={(e) => handleChange(e, 'notes')}
                />
              </IonItem>
              
              <div className="ion-padding">
                <IonButton expand="block" type="submit">
                  Save Changes
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default EmergencyContacts;