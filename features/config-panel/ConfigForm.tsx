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

  return (
    <form onSubmit={handleSubmit(onGenerate)} className="max-w-2xl mx-auto grid grid-cols-1 gap-y-6">
        <Input 
            label="Total Duration"
            {...register('duration')}
            error={errors.duration?.message}
            placeholder="e.g., 30s, 10m, 24h"
        />
        
        <div>
            <span className="block text-sm font-medium text-gray-300 mb-2">Milestone Format</span>
            <div className="flex rounded-md shadow-sm">
                <Controller
                    name="milestoneMode"
                    control={control}
                    render={({ field }) => (
                        <>
                            <button type="button" onClick={() => { field.onChange('percentage'); setMilestoneMode('percentage'); }} className={`relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-150 ${field.value === 'percentage' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                            Percentage (%)
                            </button>
                            <button type="button" onClick={() => { field.onChange('time'); setMilestoneMode('time'); }} className={`-ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-150 ${field.value === 'time' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
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
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-secondary"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="isCycling" className="font-medium text-gray-300">
                Cycle Animation
                </label>
                <p id="cycle-description" className="text-xs text-gray-500">
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
            <div className="mt-4 max-w-2xl mx-auto bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
                {scriptError}
            </div>
        )}
    </form>
  );
};