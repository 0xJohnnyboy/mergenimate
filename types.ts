export interface ImageInfo {
  id: string; // Use a unique ID for React keys instead of src
  src: string;
  width: number;
  height: number;
  file: File;
}

export type MilestoneMode = 'percentage' | 'time';

export interface AnimationConfig {
  duration: string;
  milestones: string[]; // Always stored as percentages
  timeMilestoneInputs: string[];
  milestoneMode: MilestoneMode;
  imagePrefix: string;
  className: string;
  isCycling: boolean;
}
