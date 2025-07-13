import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HospitalProfileStep {
  step: number;
  title: string;
  completed: boolean;
  completionTime?: string;
  requiredFields?: string[];
}

export interface HospitalProfileProgress {
  step1_completed: boolean;
  step2_completed: boolean;
  step3_completed: boolean;
  step4_completed: boolean;
  step1_completion_time?: string;
  step2_completion_time?: string;
  step3_completion_time?: string;
  step4_completion_time?: string;
  currentStep: number;
}

const STORAGE_KEY = 'hospital_profile_progress';

export const HOSPITAL_PROFILE_STEPS: HospitalProfileStep[] = [
  {
    step: 1,
    title: 'Basic Details',
    completed: false,
    requiredFields: ['name', 'description', 'phone', 'email']
  },
  {
    step: 2,
    title: 'Location & Map',
    completed: false,
    requiredFields: ['address', 'city', 'country']
  },
  {
    step: 3,
    title: 'Conditions Treated',
    completed: false,
    requiredFields: ['conditions_treated']
  },
  {
    step: 4,
    title: 'Review & Confirm',
    completed: false,
    requiredFields: []
  }
];

export class HospitalProfileStepManager {
  private static instance: HospitalProfileStepManager;
  private progress: HospitalProfileProgress;

  private constructor() {
    this.progress = {
      step1_completed: false,
      step2_completed: false,
      step3_completed: false,
      step4_completed: false,
      currentStep: 1
    };
  }

  public static getInstance(): HospitalProfileStepManager {
    if (!HospitalProfileStepManager.instance) {
      HospitalProfileStepManager.instance = new HospitalProfileStepManager();
    }
    return HospitalProfileStepManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        this.progress = { ...this.progress, ...JSON.parse(savedProgress) };
      }
    } catch (error) {
      console.error('Error loading hospital profile progress:', error);
    }
  }

  public async saveProgress(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Error saving hospital profile progress:', error);
    }
  }

  public getProgress(): HospitalProfileProgress {
    return { ...this.progress };
  }

  public getCurrentStep(): number {
    return this.progress.currentStep;
  }

  public canAccessStep(stepNumber: number): boolean {
    // Can only access current step or previous completed steps
    if (stepNumber <= this.progress.currentStep) {
      return true;
    }
    
    // Can access next step only if current step is completed
    if (stepNumber === this.progress.currentStep + 1) {
      return this.isStepCompleted(this.progress.currentStep);
    }
    
    return false;
  }

  public isStepCompleted(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return this.progress.step1_completed;
      case 2:
        return this.progress.step2_completed;
      case 3:
        return this.progress.step3_completed;
      case 4:
        return this.progress.step4_completed;
      default:
        return false;
    }
  }

  public async markStepCompleted(stepNumber: number): Promise<void> {
    const completionTime = new Date().toISOString();
    
    switch (stepNumber) {
      case 1:
        this.progress.step1_completed = true;
        this.progress.step1_completion_time = completionTime;
        this.progress.currentStep = 2;
        break;
      case 2:
        this.progress.step2_completed = true;
        this.progress.step2_completion_time = completionTime;
        this.progress.currentStep = 3;
        break;
      case 3:
        this.progress.step3_completed = true;
        this.progress.step3_completion_time = completionTime;
        this.progress.currentStep = 4;
        break;
      case 4:
        this.progress.step4_completed = true;
        this.progress.step4_completion_time = completionTime;
        break;
    }
    
    await this.saveProgress();
  }

  public async resetProgress(): Promise<void> {
    this.progress = {
      step1_completed: false,
      step2_completed: false,
      step3_completed: false,
      step4_completed: false,
      currentStep: 1
    };
    await this.saveProgress();
  }

  public getCompletedSteps(): number[] {
    const completed: number[] = [];
    if (this.progress.step1_completed) completed.push(1);
    if (this.progress.step2_completed) completed.push(2);
    if (this.progress.step3_completed) completed.push(3);
    if (this.progress.step4_completed) completed.push(4);
    return completed;
  }

  public getNextStep(): number {
    if (!this.progress.step1_completed) return 1;
    if (!this.progress.step2_completed) return 2;
    if (!this.progress.step3_completed) return 3;
    if (!this.progress.step4_completed) return 4;
    return 4; // All completed
  }

  public isProfileComplete(): boolean {
    return this.progress.step1_completed && 
           this.progress.step2_completed && 
           this.progress.step3_completed && 
           this.progress.step4_completed;
  }
}

export const hospitalProfileStepManager = HospitalProfileStepManager.getInstance(); 