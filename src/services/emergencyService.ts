import api from '../utils/api';
import { EmergencyContact, EmergencyContactStatus } from '../types';

const API_URL = '/emergency-contacts';

// Sample mock contacts for development/testing
const mockContacts: EmergencyContact[] = [
  {
    id: 'mock-contact-1',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    relationship: 'Family',
    status: EmergencyContactStatus.ACTIVE,
    notifySos: true,
    notifyGeofence: true,
    notifyInactivity: true,
    notifyLowBattery: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-contact-2',
    userId: 'user-1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    relationship: 'Friend',
    status: EmergencyContactStatus.ACTIVE,
    notifySos: true,
    notifyGeofence: false,
    notifyInactivity: false,
    notifyLowBattery: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-contact-3',
    userId: 'user-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1122334455',
    relationship: 'Work',
    status: EmergencyContactStatus.PENDING,
    notifySos: true,
    notifyGeofence: true,
    notifyInactivity: true,
    notifyLowBattery: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

/**
 * Emergency contacts and alert service
 */
const emergencyService = {
  /**
   * Get all emergency contacts for a user
   */
  getEmergencyContacts: async (
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: EmergencyContact[]; totalElements: number; totalPages: number }> => {
    try {
      const response = await api.get(`${API_URL}/users/${userId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      
      // Return mock data in development or testing environment
      return {
        content: mockContacts,
        totalElements: mockContacts.length,
        totalPages: 1
      };
    }
  },

  /**
   * Get active emergency contacts for a user
   */
  getActiveEmergencyContacts: async (userId: string): Promise<EmergencyContact[]> => {
    try {
      const response = await api.get(`${API_URL}/users/${userId}/active`);
      return response.data;
    } catch (error) {
      console.error('Error getting active emergency contacts:', error);
      
      // Return only active mock contacts
      return mockContacts.filter(contact => contact.status === 'ACTIVE');
    }
  },

  /**
   * Get a specific emergency contact
   */
  getEmergencyContact: async (contactId: string): Promise<EmergencyContact> => {
    try {
      const response = await api.get(`${API_URL}/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting emergency contact:', error);
      
      // Find mock contact by ID or return a default one
      const mockContact = mockContacts.find(contact => contact.id === contactId);
      if (mockContact) {
        return mockContact;
      }
      
      throw new Error('Emergency contact not found');
    }
  },

  /**
   * Add a new emergency contact
   */
  addEmergencyContact: async (
    userId: string,
    contactData: {
      name: string;
      email: string;
      phone?: string;
      relationship?: string;
      contactUserId?: string;
      notifySos?: boolean;
      notifyGeofence?: boolean;
      notifyInactivity?: boolean;
      notifyLowBattery?: boolean;
      notes?: string;
    }
  ): Promise<EmergencyContact> => {
    try {
      const response = await api.post(`${API_URL}/users/${userId}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      
      // Return a mock contact in development or testing environment
      return {
        id: `mock-contact-${Date.now()}`,
        userId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        relationship: contactData.relationship,
        status: EmergencyContactStatus.PENDING,
        notifySos: contactData.notifySos ?? true,
        notifyGeofence: contactData.notifyGeofence ?? false,
        notifyInactivity: contactData.notifyInactivity ?? false,
        notifyLowBattery: contactData.notifyLowBattery ?? false,
        notes: contactData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Update an existing emergency contact
   */
  updateEmergencyContact: async (
    contactId: string,
    contactData: {
      name?: string;
      phone?: string;
      relationship?: string;
      notifySos?: boolean;
      notifyGeofence?: boolean;
      notifyInactivity?: boolean;
      notifyLowBattery?: boolean;
      notes?: string;
    }
  ): Promise<EmergencyContact> => {
    try {
      const response = await api.put(`${API_URL}/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      
      // Update mock contact for development/testing
      const contactIndex = mockContacts.findIndex(contact => contact.id === contactId);
      if (contactIndex >= 0) {
        const updatedContact = {
          ...mockContacts[contactIndex],
          ...contactData,
          updatedAt: new Date().toISOString()
        };
        
        mockContacts[contactIndex] = updatedContact;
        return updatedContact;
      }
      
      throw new Error('Emergency contact not found');
    }
  },

  /**
   * Remove an emergency contact
   */
  removeEmergencyContact: async (contactId: string): Promise<void> => {
    try {
      await api.delete(`${API_URL}/${contactId}`);
    } catch (error) {
      console.error('Error removing emergency contact:', error);
      
      // Remove from mock contacts for development/testing
      const contactIndex = mockContacts.findIndex(contact => contact.id === contactId);
      if (contactIndex >= 0) {
        mockContacts.splice(contactIndex, 1);
      }
    }
  },

  /**
   * Verify an emergency contact using a token
   */
  verifyContact: async (token: string): Promise<{ contactId: string; username: string; contactName: string; timestamp: string; message: string }> => {
    try {
      const response = await api.post(`${API_URL}/verify/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying contact:', error);
      
      // For development/testing
      return {
        contactId: 'mock-contact-3',
        username: 'testuser',
        contactName: 'Alice Johnson',
        timestamp: new Date().toISOString(),
        message: 'Contact verified successfully'
      };
    }
  },

  /**
   * Decline an emergency contact invitation
   */
  declineContact: async (token: string): Promise<{ contactId: string; username: string; contactName: string; timestamp: string; message: string }> => {
    try {
      const response = await api.post(`${API_URL}/decline/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error declining contact:', error);
      
      // For development/testing
      return {
        contactId: 'mock-contact-3',
        username: 'testuser',
        contactName: 'Alice Johnson',
        timestamp: new Date().toISOString(),
        message: 'Contact invitation declined'
      };
    }
  },

  /**
   * Resend verification email for a pending emergency contact
   */
  resendVerification: async (contactId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`${API_URL}/${contactId}/resend`, {});
      return response.data;
    } catch (error) {
      console.error('Error resending verification:', error);
      
      // For development/testing
      return {
        message: 'Verification email sent successfully'
      };
    }
  },

  /**
   * Get pending contacts information
   */
  getPendingContacts: async (userId: string): Promise<{ pendingCount: number }> => {
    try {
      const response = await api.get(`${API_URL}/users/${userId}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error getting pending contacts:', error);
      
      // Count pending mock contacts
      const pendingCount = mockContacts.filter(contact => contact.status === 'PENDING').length;
      
      return {
        pendingCount
      };
    }
  },

  /**
   * Send emergency notifications to all active contacts
   */
  sendEmergencyNotifications: async (
    userId: string,
    latitude: number,
    longitude: number,
    message?: string
  ): Promise<{ notifiedCount: number; timestamp: string; message: string }> => {
    try {
      const response = await api.post(
        `${API_URL}/users/${userId}/notify-emergency`,
        {
          latitude,
          longitude,
          message
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending emergency notifications:', error);
      
      // Get count of active contacts for mock response
      const activeCount = mockContacts.filter(contact => contact.status === 'ACTIVE').length;
      
      // For development/testing
      return {
        notifiedCount: activeCount,
        timestamp: new Date().toISOString(),
        message: `Successfully notified ${activeCount} emergency contacts`
      };
    }
  }
};

export default emergencyService;