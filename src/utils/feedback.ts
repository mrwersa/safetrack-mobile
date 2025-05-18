import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Howl } from 'howler';

// Sound effects
const sounds = {
  emergency: new Howl({
    src: ['/assets/sounds/emergency-alert.mp3'],
    volume: 1.0,
    loop: true
  }),
  notification: new Howl({
    src: ['/assets/sounds/notification.mp3'],
    volume: 0.7
  }),
  success: new Howl({
    src: ['/assets/sounds/success.mp3'],
    volume: 0.5
  })
};

export const feedback = {
  /**
   * Trigger emergency haptic feedback
   */
  emergencyHaptic: async () => {
    try {
      // Trigger heavy impact three times
      for (let i = 0; i < 3; i++) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      await Haptics.vibrate();
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  /**
   * Play emergency sound
   */
  playEmergencySound: () => {
    sounds.emergency.play();
  },

  /**
   * Stop emergency sound
   */
  stopEmergencySound: () => {
    sounds.emergency.stop();
  },

  /**
   * Play notification sound
   */
  playNotificationSound: () => {
    sounds.notification.play();
  },

  /**
   * Play success sound
   */
  playSuccessSound: () => {
    sounds.success.play();
  },

  /**
   * Combined emergency feedback
   */
  triggerEmergencyFeedback: async () => {
    await feedback.emergencyHaptic();
    feedback.playEmergencySound();
  },

  /**
   * Combined success feedback
   */
  triggerSuccessFeedback: async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    feedback.playSuccessSound();
  }
}; 