export interface ImageInfo {
  id: string; // Use a unique ID for React keys instead of src
  src: string;
  width: number;
  height: number;
  file: File;
}

export type MilestoneMode = 'percentage' | 'time';
export type Framework = 'script' | 'react' | 'vue' | 'svelte';

export interface AnimationConfig {
  duration: string;
  milestones: string[]; // Always stored as percentages
  timeMilestoneInputs: string[];
  milestoneMode: MilestoneMode;
  framework: Framework;
  imagePrefix: string;
  className: string;
  isCycling: boolean;
}
