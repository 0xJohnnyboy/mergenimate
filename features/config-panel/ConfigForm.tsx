import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '../../store';
import { configSchema, AnimationConfigFormData } from './configSchema';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface ConfigFormProps {
  onGenerate: (data: AnimationConfigFormData) => void;
  scriptError: string | null;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onGenerate, scriptError }) => {
  const { config, setMilestoneMode, images } = useAppStore(state => ({
    config: state.config,
    setMilestoneMode: state.setMilestoneMode,
    images: state.images,
  }));

  // Memoize defaultValues to prevent re-initialization on every render.
  // The form is updated via the `reset` method in the useEffect hook.
  const [defaultValues] = useState(() => ({
    ...config,
    milestones: config.milestones.map(m => ({ value: m })),
    timeMilestoneInputs: config.timeMilestoneInputs.map(t => ({ value: t })),
  }));

  const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm<AnimationConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues,
  });

  const { fields: milestoneFields } = useFieldArray({ control, name: 'milestones' });
  const { fields: timeMilestoneFields } = useFieldArray({ control, name: 'timeMilestoneInputs' });

  const milestoneMode = watch('milestoneMode');

  // Reset form ONLY when the number of images changes (i.e. the form structure changes).
  // This avoids a re-render loop on submit.
  useEffect(() => {
    const latestConfig = useAppStore.getState().config;
    reset({
      ...latestConfig,
      milestones: latestConfig.milestones.map(value => ({ value })),
      timeMilestoneInputs: latestConfig.timeMilestoneInputs.map(value => ({ value })),
    });
    // We intentionally omit `config` from dependencies to break the loop.
    // The form only needs to reset when its structure changes, which is tied to image count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, reset]);

  const onSubmit = (data: AnimationConfigFormData) => {
    console.log('Form submitted with data:', data);
    onGenerate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto grid grid-cols-1 gap-y-6">
        <Input
            label="Total Duration"
            {...register('duration')}
            error={errors.duration?.message}
            placeholder="e.g., 30s, 10m, 24h"
        />

        <Input
            label="Start At (optional)"
            {...register('startAt')}
            error={errors.startAt?.message}
            placeholder="e.g., 50% or 30s"
            description="Start the animation at a specific position (percentage or time)."
        />

        <div>
            <span className="block text-sm font-medium mb-2">Output Format</span>
            <div className="flex rounded-md shadow-sm mb-4">
                <Controller
                    name="framework"
                    control={control}
                    render={({ field }) => (
                        <>
                            <button type="button" onClick={() => field.onChange('script')} className={`relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'script' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            Script Tag
                            </button>
                            <button type="button" onClick={() => field.onChange('react')} className={`-ml-px relative inline-flex items-center justify-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'react' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            React
                            </button>
                            <button type="button" onClick={() => field.onChange('vue')} className={`-ml-px relative inline-flex items-center justify-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'vue' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            Vue
                            </button>
                            <button type="button" onClick={() => field.onChange('svelte')} className={`-ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'svelte' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            Svelte
                            </button>
                        </>
                    )}
                />
            </div>
        </div>

        <div>
            <span className="block text-sm font-medium mb-2">Milestone Format</span>
            <div className="flex rounded-md shadow-sm">
                <Controller
                    name="milestoneMode"
                    control={control}
                    render={({ field }) => (
                        <>
                            <button type="button" onClick={() => { field.onChange('percentage'); setMilestoneMode('percentage'); }} className={`relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'percentage' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            Percentage (%)
                            </button>
                            <button type="button" onClick={() => { field.onChange('time'); setMilestoneMode('time'); }} className={`-ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 ${field.value === 'time' ? 'bg-primary border-primary text-primary-content' : 'bg-base-200 border-base-300 hover:bg-base-300'}`}>
                            Time
                            </button>
                        </>
                    )}
                />
            </div>
        </div>
      
        <div className="grid grid-cols-2 gap-4">
          {milestoneMode === 'percentage' ? milestoneFields.map((field, index) => (
            <Input
              key={field.id}
              label={`Time for Image ${index + 2} (%)`}
              type="number"
              {...register(`milestones.${index}.value`)}
              error={errors.milestones?.[index]?.value?.message}
              placeholder="e.g., 25"
            />
          )) : timeMilestoneFields.map((field, index) => (
             <Input
              key={field.id}
              label={`Time for Image ${index + 2}`}
              type="text"
              {...register(`timeMilestoneInputs.${index}.value`)}
              error={errors.timeMilestoneInputs?.[index]?.value?.message}
              placeholder="e.g., 20s, 1.5m"
            />
          ))}
        </div>

        <Input 
            label="Image URL Prefix"
            {...register('imagePrefix')}
            error={errors.imagePrefix?.message}
            description="The script will append numbers (1, 2,...) and the file extension."
            placeholder="e.g., /img/my-slider-"
        />

        <Input 
            label="Custom CSS Classes (optional)"
            {...register('className')}
            error={errors.className?.message}
            description="Apply custom classes to the animation container."
            placeholder="e.g., custom-slider rounded-lg"
        />

        <div className="relative flex items-start pt-2">
            <div className="flex h-5 items-center">
                <input
                    id="isCycling"
                    type="checkbox"
                    {...register('isCycling')}
                    className="h-4 w-4 rounded border-base-300 bg-base-200 text-primary focus:ring-primary"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="isCycling" className="font-medium">
                Cycle Animation
                </label>
                <p id="cycle-description" className="text-xs opacity-60">
                Smoothly transition from the last image back to the first.
                </p>
            </div>
        </div>
      
        <div className="text-center mt-4">
            <Button type="submit" className="w-full px-6 py-3">
                Generate Embed Code
            </Button>
        </div>
        
        {scriptError && (
            <div className="mt-4 max-w-2xl mx-auto alert alert-error text-sm">
                {scriptError}
            </div>
        )}
    </form>
  );
};