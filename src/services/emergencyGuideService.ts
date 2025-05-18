import api from '../utils/api';

export interface EmergencyGuide {
  id: string;
  title: string;
  category: EmergencyCategory;
  steps: EmergencyStep[];
  priority: number;
  lastUpdated: string;
}

export interface EmergencyStep {
  id: string;
  order: number;
  instruction: string;
  details?: string;
  warning?: string;
  image?: string;
}

export enum EmergencyCategory {
  MEDICAL = 'medical',
  FIRE = 'fire',
  NATURAL_DISASTER = 'natural_disaster',
  PERSONAL_SAFETY = 'personal_safety',
  VEHICLE = 'vehicle',
  OTHER = 'other'
}

class EmergencyGuideService {
  private guides: EmergencyGuide[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.loadCachedGuides();
  }

  /**
   * Load guides from cache
   */
  private loadCachedGuides(): void {
    try {
      const cached = localStorage.getItem('emergencyGuides');
      if (cached) {
        const { guides, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          this.guides = guides;
          this.lastFetchTime = timestamp;
        }
      }
    } catch (error) {
      console.error('Error loading cached guides:', error);
    }
  }

  /**
   * Save guides to cache
   */
  private saveGuidesToCache(): void {
    try {
      localStorage.setItem('emergencyGuides', JSON.stringify({
        guides: this.guides,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving guides to cache:', error);
    }
  }

  /**
   * Fetch all emergency guides
   */
  async fetchGuides(): Promise<EmergencyGuide[]> {
    try {
      // Check if cache is still valid
      if (Date.now() - this.lastFetchTime < this.CACHE_DURATION && this.guides.length > 0) {
        return this.guides;
      }

      const response = await api.get('/emergency-guides');
      this.guides = response.data;
      this.lastFetchTime = Date.now();
      this.saveGuidesToCache();
      return this.guides;
    } catch (error) {
      console.error('Error fetching guides:', error);
      return this.guides; // Return cached guides if available
    }
  }

  /**
   * Get guides by category
   */
  async getGuidesByCategory(category: EmergencyCategory): Promise<EmergencyGuide[]> {
    const guides = await this.fetchGuides();
    return guides.filter(guide => guide.category === category);
  }

  /**
   * Get a specific guide by ID
   */
  async getGuideById(guideId: string): Promise<EmergencyGuide | null> {
    const guides = await this.fetchGuides();
    return guides.find(guide => guide.id === guideId) ?? null;
  }

  /**
   * Search guides by keyword
   */
  async searchGuides(keyword: string): Promise<EmergencyGuide[]> {
    const guides = await this.fetchGuides();
    const searchTerm = keyword.toLowerCase();
    
    return guides.filter(guide => 
      guide.title.toLowerCase().includes(searchTerm) ||
      guide.steps.some(step => 
        step.instruction.toLowerCase().includes(searchTerm) ||
        (step.details?.toLowerCase().includes(searchTerm) ?? false)
      )
    );
  }

  /**
   * Get high priority guides
   */
  async getHighPriorityGuides(): Promise<EmergencyGuide[]> {
    const guides = await this.fetchGuides();
    return guides
      .filter(guide => guide.priority >= 8)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get quick reference guide for an emergency type
   */
  async getQuickReference(category: EmergencyCategory): Promise<EmergencyStep[]> {
    const guides = await this.getGuidesByCategory(category);
    const highestPriority = guides.reduce((max, guide) => 
      guide.priority > max ? guide.priority : max, 0
    );
    
    const primaryGuide = guides.find(guide => guide.priority === highestPriority);
    return primaryGuide?.steps ?? [];
  }

  /**
   * Get all available categories
   */
  getCategories(): EmergencyCategory[] {
    return Object.values(EmergencyCategory);
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: EmergencyCategory): string {
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Clear cached guides
   */
  clearCache(): void {
    this.guides = [];
    this.lastFetchTime = 0;
    localStorage.removeItem('emergencyGuides');
  }
}

// Sample emergency guides for offline access
const SAMPLE_GUIDES: EmergencyGuide[] = [
  {
    id: 'basic-first-aid',
    title: 'Basic First Aid',
    category: EmergencyCategory.MEDICAL,
    priority: 10,
    lastUpdated: new Date().toISOString(),
    steps: [
      {
        id: 'check-response',
        order: 1,
        instruction: 'Check Response',
        details: 'Check if the person is conscious by gently shaking them and asking if they\'re okay.'
      },
      {
        id: 'call-help',
        order: 2,
        instruction: 'Call for Help',
        details: 'If the person is unresponsive, call emergency services immediately.'
      },
      {
        id: 'check-breathing',
        order: 3,
        instruction: 'Check Breathing',
        details: 'Look, listen, and feel for breathing for up to 10 seconds.'
      },
      {
        id: 'start-cpr',
        order: 4,
        instruction: 'Start CPR if Needed',
        details: 'If not breathing normally, start CPR: 30 chest compressions followed by 2 rescue breaths.',
        warning: 'Only perform CPR if trained to do so.'
      }
    ]
  },
  {
    id: 'fire-safety',
    title: 'Fire Emergency',
    category: EmergencyCategory.FIRE,
    priority: 9,
    lastUpdated: new Date().toISOString(),
    steps: [
      {
        id: 'raise-alarm',
        order: 1,
        instruction: 'Raise the Alarm',
        details: 'Activate fire alarm if available and alert others in the building.'
      },
      {
        id: 'evacuate',
        order: 2,
        instruction: 'Evacuate',
        details: 'Leave the building immediately using nearest safe exit. Do not use elevators.',
        warning: 'Never return to a burning building.'
      },
      {
        id: 'call-fire',
        order: 3,
        instruction: 'Call Fire Department',
        details: 'Once safely outside, call emergency services.'
      }
    ]
  }
];

export const emergencyGuideService = new EmergencyGuideService(); 