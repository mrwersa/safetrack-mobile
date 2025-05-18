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
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonButtons,
  IonBackButton,
  useIonToast,
  IonSpinner,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
} from '@ionic/react';
import { add, call, mail, person, trash } from 'ionicons/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import './ContactsPage.css';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [presentToast] = useIonToast();
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const auth = useSelector((state: RootState) => state.auth);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/contacts`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      presentToast({
        message: 'Failed to load emergency contacts',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      if (!newContact.name || !newContact.phone) {
        presentToast({
          message: 'Name and phone number are required',
          duration: 3000,
          color: 'warning'
        });
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/contacts`,
        newContact,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      setContacts([...contacts, response.data]);
      setShowModal(false);
      setNewContact({});
      presentToast({
        message: 'Contact added successfully',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      presentToast({
        message: 'Failed to add contact',
        duration: 3000,
        color: 'danger'
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/contacts/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      setContacts(contacts.filter(contact => contact.id !== id));
      presentToast({
        message: 'Contact deleted successfully',
        duration: 2000,
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      presentToast({
        message: 'Failed to delete contact',
        duration: 3000,
        color: 'danger'
      });
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
        {isLoading ? (
          <div className="loading-container">
            <IonSpinner />
            <p>Loading contacts...</p>
          </div>
        ) : (
          <IonList>
            {contacts.map(contact => (
              <IonItemSliding key={contact.id}>
                <IonItem>
                  <IonIcon icon={person} slot="start" />
                  <IonLabel>
                    <h2>{contact.name}</h2>
                    <p>{contact.relationship}</p>
                    <p>{contact.phone}</p>
                  </IonLabel>
                  <IonButtons slot="end">
                    <IonButton href={`tel:${contact.phone}`}>
                      <IonIcon icon={call} />
                    </IonButton>
                    <IonButton href={`mailto:${contact.email}`}>
                      <IonIcon icon={mail} />
                    </IonButton>
                  </IonButtons>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => handleDeleteContact(contact.id)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add Emergency Contact</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="ion-padding">
              <IonItem>
                <IonLabel position="stacked">Name *</IonLabel>
                <IonInput
                  value={newContact.name}
                  onIonChange={e => setNewContact({ ...newContact, name: e.detail.value! })}
                  placeholder="Enter contact name"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Phone *</IonLabel>
                <IonInput
                  type="tel"
                  value={newContact.phone}
                  onIonChange={e => setNewContact({ ...newContact, phone: e.detail.value! })}
                  placeholder="Enter phone number"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={newContact.email}
                  onIonChange={e => setNewContact({ ...newContact, email: e.detail.value! })}
                  placeholder="Enter email address"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Relationship</IonLabel>
                <IonInput
                  value={newContact.relationship}
                  onIonChange={e => setNewContact({ ...newContact, relationship: e.detail.value! })}
                  placeholder="E.g., Family, Friend, Doctor"
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleAddContact}
                className="ion-margin-top"
              >
                Add Contact
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ContactsPage; 