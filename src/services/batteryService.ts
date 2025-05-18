import { Device } from '@capacitor/device';
import { LocalNotifications } from '@capacitor/local-notifications';
import { feedback } from '../utils/feedback';
import api from '../utils/api';

interface BatteryInfo {
  batteryLevel: number;
  isCharging: boolean;
  timestamp: string;
}

class BatteryService {
  private batteryCheckInterval: number | null = null;
  private lastBatteryLevel: number = 100;
  private isMonitoring: boolean = false;
  private lowBatteryThreshold: number = 20;
  private criticalBatteryThreshold: number = 10;
  private notifiedContacts: boolean = false;

  /**
   * Start battery monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    try {
      this.isMonitoring = true;
      await this.checkBattery();

      // Check battery every 5 minutes
      this.batteryCheckInterval = window.setInterval(async () => {
        await this.checkBattery();
      }, 5 * 60 * 1000) as unknown as number;

    } catch (error) {
      console.error('Error starting battery monitoring:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop battery monitoring
   */
  stopMonitoring(): void {
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
      this.batteryCheckInterval = null;
    }
    this.isMonitoring = false;
    this.notifiedContacts = false;
  }

  /**
   * Check battery status and handle notifications
   */
  private async checkBattery(): Promise<void> {
    try {
      const info = await Device.getBatteryInfo();
      const batteryLevel = (info.batteryLevel ?? 1) * 100;
      const isCharging = info.isCharging ?? false;

      // Record battery info
      await this.recordBatteryInfo({
        batteryLevel,
        isCharging,
        timestamp: new Date().toISOString()
      });

      // Handle low battery scenarios
      if (batteryLevel <= this.criticalBatteryThreshold && !isCharging) {
        await this.handleCriticalBattery(batteryLevel);
      } else if (batteryLevel <= this.lowBatteryThreshold && !isCharging) {
        await this.handleLowBattery(batteryLevel);
      } else if (batteryLevel > this.lowBatteryThreshold && this.notifiedContacts) {
        // Reset notification flag when battery is charged
        this.notifiedContacts = false;
      }

      this.lastBatteryLevel = batteryLevel;
    } catch (error) {
      console.error('Error checking battery:', error);
    }
  }

  /**
   * Handle critical battery level
   */
  private async handleCriticalBattery(level: number): Promise<void> {
    try {
      // Show notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'CRITICAL Battery Level!',
            body: `Battery at ${level}%! Please charge your device immediately to maintain safety features.`,
            id: 3,
            schedule: { at: new Date(Date.now()) }
          }
        ]
      });

      feedback.playNotificationSound();

      // Notify emergency contacts if not already notified
      if (!this.notifiedContacts) {
        await this.notifyEmergencyContacts(level);
        this.notifiedContacts = true;
      }

      // Implement power saving measures
      this.enablePowerSaving();
    } catch (error) {
      console.error('Error handling critical battery:', error);
    }
  }

  /**
   * Handle low battery level
   */
  private async handleLowBattery(level: number): Promise<void> {
    try {
      // Show notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Low Battery Warning',
            body: `Battery at ${level}%. Please charge your device soon.`,
            id: 4,
            schedule: { at: new Date(Date.now()) }
          }
        ]
      });

      feedback.playNotificationSound();
    } catch (error) {
      console.error('Error handling low battery:', error);
    }
  }

  /**
   * Enable power saving measures
   */
  private enablePowerSaving(): void {
    // Reduce location update frequency
    // Disable non-critical features
    // These would be implemented based on the app's specific features
  }

  /**
   * Notify emergency contacts about critical battery
   */
  private async notifyEmergencyContacts(level: number): Promise<void> {
    try {
      await api.post('/notifications/battery-critical', {
        batteryLevel: level,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error notifying contacts about battery:', error);
    }
  }

  /**
   * Record battery information
   */
  private async recordBatteryInfo(info: BatteryInfo): Promise<void> {
    try {
      await api.post('/battery/log', info);
    } catch (error) {
      console.error('Error recording battery info:', error);
      
      // Store locally if API call fails
      const batteryLogs = JSON.parse(localStorage.getItem('batteryLogs') || '[]');
      batteryLogs.push(info);
      localStorage.setItem('batteryLogs', JSON.stringify(batteryLogs));
    }
  }

  /**
   * Get current battery info
   */
  async getCurrentBatteryInfo(): Promise<BatteryInfo> {
    const info = await Device.getBatteryInfo();
    return {
      batteryLevel: (info.batteryLevel ?? 1) * 100,
      isCharging: info.isCharging ?? false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set low battery threshold
   */
  setLowBatteryThreshold(threshold: number): void {
    if (threshold > 0 && threshold < 100) {
      this.lowBatteryThreshold = threshold;
    }
  }

  /**
   * Set critical battery threshold
   */
  setCriticalBatteryThreshold(threshold: number): void {
    if (threshold > 0 && threshold < this.lowBatteryThreshold) {
      this.criticalBatteryThreshold = threshold;
    }
  }
}

export const batteryService = new BatteryService(); 