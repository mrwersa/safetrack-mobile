import { Network, NetworkStatus } from '@capacitor/network';
import api from '../utils/api';

interface SyncItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: string;
  retryCount: number;
}

class SyncService {
  private syncQueue: SyncItem[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private maxRetries: number = 3;
  private syncInterval: number | null = null;

  constructor() {
    this.loadQueueFromStorage();
    this.setupNetworkListeners();
  }

  /**
   * Initialize network listeners
   */
  private async setupNetworkListeners(): Promise<void> {
    try {
      // Get initial network status
      const status = await Network.getStatus();
      this.isOnline = status.connected;

      // Listen for network changes
      Network.addListener('networkStatusChange', (status: NetworkStatus) => {
        const wasOffline = !this.isOnline;
        this.isOnline = status.connected;

        // If we just came back online, start sync
        if (wasOffline && this.isOnline) {
          this.startSync();
        }
      });

      // Start periodic sync if online
      if (this.isOnline) {
        this.startSync();
      }
    } catch (error) {
      console.error('Error setting up network listeners:', error);
    }
  }

  /**
   * Start synchronization process
   */
  private async startSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) return;

    try {
      this.isSyncing = true;

      // Process queue items
      const queueCopy = [...this.syncQueue];
      for (const item of queueCopy) {
        try {
          await this.processSyncItem(item);
          this.removeFromQueue(item.id);
        } catch (error) {
          console.error(`Error processing sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove if max retries exceeded
          if (item.retryCount >= this.maxRetries) {
            this.removeFromQueue(item.id);
            // Could notify user or log failed items
          }
        }
      }

      // Save updated queue
      this.saveQueueToStorage();

    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync item
   */
  private async processSyncItem(item: SyncItem): Promise<void> {
    switch (item.method) {
      case 'POST':
        await api.post(item.endpoint, item.data);
        break;
      case 'PUT':
        await api.put(item.endpoint, item.data);
        break;
      case 'DELETE':
        await api.delete(item.endpoint);
        break;
    }
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(
    endpoint: string,
    method: SyncItem['method'],
    data: any
  ): Promise<void> {
    const item: SyncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.syncQueue.push(item);
    this.saveQueueToStorage();

    // Try to sync immediately if online
    if (this.isOnline) {
      await this.startSync();
    }
  }

  /**
   * Remove item from sync queue
   */
  private removeFromQueue(id: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
  }

  /**
   * Save queue to local storage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Load queue from local storage
   */
  private loadQueueFromStorage(): void {
    try {
      const saved = localStorage.getItem('syncQueue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Get current sync queue
   */
  getQueue(): SyncItem[] {
    return [...this.syncQueue];
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.syncQueue.length;
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueueToStorage();
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }
}

export const syncService = new SyncService(); 