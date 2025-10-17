import { create } from 'zustand';
import { ImageInfo, AnimationConfig, MilestoneMode } from './types';
import { processFiles } from './services/imageProcessor';
import { parseDuration, millisecondsToFriendlyString } from './lib/time';

interface AppState {
  images: ImageInfo[];
  config: AnimationConfig;
  sliderValue: number;
  isAnimating: boolean;
  isLoading: boolean;
  error: string | null;
  generatedEmbedTag: string | null;
  scriptError: string | null;

  // Actions
  addImages: (files: FileList | null) => Promise<void>;
  removeImage: (id: string) => void;
  reorderImages: (dragIndex: number, dropIndex: number) => void;
  reset: () => void;

  setConfig: (newConfig: Partial<AnimationConfig>) => void;
  setMilestoneMode: (mode: MilestoneMode) => void;
  handleTimeMilestoneChange: (index: number, value: string) => void;

  setSliderValue: (value: number) => void;
  toggleAnimation: () => void;
  stopAnimation: () => void;

  setGeneratedEmbedTag: (tag: string | null) => void;
  setScriptError: (error: string | null) => void;
}

const initialConfig: AnimationConfig = {
  duration: '60s',
  milestones: [],
  timeMilestoneInputs: [],
  milestoneMode: 'percentage',
  framework: 'script',
  imagePrefix: '/images/slider-',
  className: '',
  isCycling: false,
  startAt: '',
};

const getInitialMilestones = (imageCount: number): { milestones: string[], timeMilestoneInputs: string[] } => {
  if (imageCount < 2) {
    return { milestones: [], timeMilestoneInputs: [] };
  }
  const newLength = imageCount - 1;
  const milestones = Array.from({ length: newLength }, (_, i) => 
    Math.round(((i + 1) / newLength) * 100).toString()
  );
  const timeMilestoneInputs = Array(newLength).fill('');
  return { milestones, timeMilestoneInputs };
};

export const useAppStore = create<AppState>((set, get) => ({
  images: [],
  config: initialConfig,
  sliderValue: 0,
  isAnimating: false,
  isLoading: false,
  error: null,
  generatedEmbedTag: null,
  scriptError: null,

  addImages: async (files) => {
    if (!files || files.length === 0) return;
    const currentImages = get().images;

    if (currentImages.length === 0 && files.length < 2) {
      set({ error: "Please upload at least two images to merge." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const newImages = await processFiles(files, currentImages[0]);
      set(state => {
        const allImages = [...state.images, ...newImages];
        const newMilestones = getInitialMilestones(allImages.length);
        return {
          images: allImages,
          isLoading: false,
          config: { ...state.config, ...newMilestones },
        };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "An unknown error occurred.", isLoading: false });
    }
  },

  removeImage: (id) => {
    set(state => {
      const updatedImages = state.images.filter(img => img.id !== id);
      if (updatedImages.length < 2) {
        return { ...getInitialState(), images: [], config: initialConfig };
      }
      const newMilestones = getInitialMilestones(updatedImages.length);
      return { 
        images: updatedImages,
        config: { ...state.config, ...newMilestones }
      };
    });
  },
  
  reorderImages: (dragIndex, dropIndex) => {
    set(state => {
      const reorderedImages = [...state.images];
      const [draggedImage] = reorderedImages.splice(dragIndex, 1);
      reorderedImages.splice(dropIndex, 0, draggedImage);
      return { images: reorderedImages };
    });
  },

  reset: () => {
    set({ ...getInitialState(), images: [], config: initialConfig });
  },

  setConfig: (newConfig) => {
    set(state => ({
      config: { ...state.config, ...newConfig }
    }));
  },
  
  setMilestoneMode: (mode) => {
    set(state => {
        if (mode === 'time') {
            const totalDurationMs = parseDuration(state.config.duration);
            if (totalDurationMs) {
                const newTimeInputs = state.config.milestones.map(m => {
                    const percent = parseFloat(m);
                    return !isNaN(percent) ? millisecondsToFriendlyString((percent / 100) * totalDurationMs) : '';
                });
                return { config: { ...state.config, milestoneMode: mode, timeMilestoneInputs: newTimeInputs } };
            }
        }
        return { config: { ...state.config, milestoneMode: mode } };
    });
  },

  handleTimeMilestoneChange: (index, value) => {
    set(state => {
        const newTimeInputs = [...state.config.timeMilestoneInputs];
        newTimeInputs[index] = value;

        const totalDurationMs = parseDuration(state.config.duration);
        const timeMs = parseDuration(value);
        if (totalDurationMs && timeMs !== null && totalDurationMs > 0) {
            const newPercentage = (timeMs / totalDurationMs) * 100;
            const newMilestones = [...state.config.milestones];
            newMilestones[index] = parseFloat(newPercentage.toFixed(4)).toString();
            return { config: { ...state.config, timeMilestoneInputs: newTimeInputs, milestones: newMilestones } };
        }
        return { config: { ...state.config, timeMilestoneInputs: newTimeInputs } };
    });
  },

  setSliderValue: (value) => set({ sliderValue: value }),
  toggleAnimation: () => set(state => ({ isAnimating: !state.isAnimating })),
  stopAnimation: () => set({ isAnimating: false }),

  setGeneratedEmbedTag: (tag) => set({ generatedEmbedTag: tag }),
  setScriptError: (error) => set({ scriptError: error }),
}));

// Helper to get a clean initial state for reset
const getInitialState = () => ({
    sliderValue: 0,
    isAnimating: false,
    isLoading: false,
    error: null,
    generatedEmbedTag: null,
    scriptError: null,
});
