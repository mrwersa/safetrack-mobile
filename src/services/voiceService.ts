import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { feedback } from '../utils/feedback';

interface VoiceCommand {
  command: string;
  action: () => Promise<void>;
  confirmationMessage: string;
}

class VoiceService {
  private isListening: boolean = false;
  private commands: VoiceCommand[] = [];
  private emergencyKeywords = [
    'help',
    'emergency',
    'sos',
    'danger',
    'police',
    'ambulance',
    'fire',
    'medical',
    'accident',
    'attack'
  ];

  constructor() {
    this.initializeCommands();
  }

  /**
   * Initialize voice commands
   */
  private initializeCommands(): void {
    // Add default commands here
    this.addCommand({
      command: 'activate emergency',
      action: async () => {
        // This would be implemented by the app
        await this.speak('Activating emergency mode. Help is on the way.');
        // Trigger emergency mode
      },
      confirmationMessage: 'Emergency mode activated. Help is on the way.'
    });

    this.addCommand({
      command: 'cancel emergency',
      action: async () => {
        // This would be implemented by the app
        await this.speak('Canceling emergency mode.');
        // Cancel emergency mode
      },
      confirmationMessage: 'Emergency mode canceled.'
    });

    this.addCommand({
      command: 'call for help',
      action: async () => {
        await this.speak('Calling emergency services.');
        // Implement emergency call
      },
      confirmationMessage: 'Calling emergency services now.'
    });
  }

  /**
   * Add a new voice command
   */
  addCommand(command: VoiceCommand): void {
    this.commands.push(command);
  }

  /**
   * Start voice recognition
   */
  async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      const { available } = await SpeechRecognition.available();
      if (!available) {
        throw new Error('Speech recognition not available');
      }

      const permissionStatus = await SpeechRecognition.requestPermissions();
      if (permissionStatus.speechRecognition !== 'granted') {
        throw new Error('Permission not granted');
      }

      this.isListening = true;

      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 2,
        prompt: 'Speak now...',
        partialResults: true,
        popup: true
      });

      await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
        const transcript = data.matches[0]?.toLowerCase() ?? '';
        this.processVoiceInput(transcript);
      });

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      throw error;
    }
  }

  /**
   * Stop voice recognition
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      await SpeechRecognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  /**
   * Process voice input
   */
  private async processVoiceInput(transcript: string): Promise<void> {
    // Check for emergency keywords first
    if (this.emergencyKeywords.some(keyword => transcript.includes(keyword))) {
      await this.handleEmergencyKeyword(transcript);
      return;
    }

    // Check for specific commands
    for (const command of this.commands) {
      if (transcript.includes(command.command.toLowerCase())) {
        await this.handleCommand(command);
        return;
      }
    }
  }

  /**
   * Handle emergency keyword detection
   */
  private async handleEmergencyKeyword(transcript: string): Promise<void> {
    try {
      await this.speak('Emergency keyword detected. Do you need help?');
      feedback.triggerEmergencyFeedback();
      
      // Wait for confirmation
      const confirmation = await this.listenForConfirmation();
      if (confirmation) {
        await this.speak('Activating emergency mode now.');
        // Trigger emergency mode
      } else {
        await this.speak('Emergency activation canceled.');
      }
    } catch (error) {
      console.error('Error handling emergency keyword:', error);
    }
  }

  /**
   * Handle specific command
   */
  private async handleCommand(command: VoiceCommand): Promise<void> {
    try {
      await command.action();
      await this.speak(command.confirmationMessage);
    } catch (error) {
      console.error('Error handling command:', error);
      await this.speak('Sorry, I could not execute that command.');
    }
  }

  /**
   * Listen for confirmation
   */
  private async listenForConfirmation(): Promise<boolean> {
    try {
      await this.speak('Please say yes to confirm or no to cancel.');
      
      return new Promise((resolve) => {
        SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
          const response = data.matches[0]?.toLowerCase() ?? '';
          
          if (response.includes('yes') || response.includes('confirm')) {
            resolve(true);
          } else if (response.includes('no') || response.includes('cancel')) {
            resolve(false);
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => resolve(false), 10000);
      });
    } catch (error) {
      console.error('Error getting confirmation:', error);
      return false;
    }
  }

  /**
   * Speak text
   */
  private async speak(text: string): Promise<void> {
    try {
      await TextToSpeech.speak({
        text,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Check if voice recognition is active
   */
  isRecognitionActive(): boolean {
    return this.isListening;
  }
}

export const voiceService = new VoiceService();

export const checkPermission = async (): Promise<boolean> => {
  try {
    const permissionStatus = await SpeechRecognition.requestPermissions();
    return permissionStatus.speechRecognition === 'granted';
  } catch (error) {
    console.error('Error checking speech recognition permission:', error);
    return false;
  }
};

export const startListening = async (onPartialResults: (matches: string[]) => void): Promise<void> => {
  try {
    await SpeechRecognition.start({
      language: 'en-US',
      maxResults: 2,
      prompt: 'Speak now...',
      partialResults: true,
      popup: true
    });

    await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
      onPartialResults(data.matches);
    });
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    throw error;
  }
}; 