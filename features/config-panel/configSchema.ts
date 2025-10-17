import { z } from 'zod';
import { parseDuration } from '../../lib/time';

const DURATION_REGEX = /^(\d+(\.\d+)?)\s*(s|m|h|d)$/i;

export const configSchema = z.object({
  duration: z.string().regex(DURATION_REGEX, "Invalid duration format. Use 's', 'm', 'h', or 'd'"),
  milestones: z.array(z.object({ value: z.string() })),
  timeMilestoneInputs: z.array(z.object({ value: z.string() })),
  milestoneMode: z.enum(['percentage', 'time']),
  framework: z.enum(['script', 'react', 'vue', 'svelte']),
  imagePrefix: z.string().nonempty('Image prefix is required.'),
  className: z.string(),
  isCycling: z.boolean(),
  startAt: z.string(),
}).superRefine((data, ctx) => {
    // Use the duration from the form data itself for validation
    const totalDurationMs = parseDuration(data.duration); 
    if (!totalDurationMs) {
        // This case should be caught by the duration regex, but it's a safeguard.
        // No need to add an issue here as the field-level validation will handle it.
        return;
    }

    let prevPercent = 0;

    const milestonesToCheck = data.milestoneMode === 'percentage' 
      ? data.milestones.map(m => m.value)
      : data.timeMilestoneInputs.map(t => t.value);

    for (let i = 0; i < milestonesToCheck.length; i++) {
        const fieldName = data.milestoneMode === 'percentage' ? `milestones.${i}.value` : `timeMilestoneInputs.${i}.value`;
        const value = milestonesToCheck[i];
        
        if (!value) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [fieldName] });
            continue;
        }
        
        let currentPercent: number;

        if (data.milestoneMode === 'time') {
            const timeMs = parseDuration(value);
            if (timeMs === null) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid time format", path: [fieldName] });
                continue;
            }
             if (timeMs > totalDurationMs) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exceeds total duration", path: [fieldName] });
                continue;
            }
            currentPercent = (timeMs / totalDurationMs) * 100;
        } else {
            currentPercent = parseFloat(value);
             if (isNaN(currentPercent)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a number", path: [fieldName] });
                continue;
            }
        }

        if (currentPercent <= 0 || currentPercent > 100) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be between 0% and 100%", path: [fieldName] });
        }

        if (currentPercent <= prevPercent) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be greater than previous", path: [fieldName] });
        }
        
        prevPercent = currentPercent;
    }

    // Validate startAt field if provided
    if (data.startAt) {
        // Try parsing as percentage first (e.g., "50" or "50%")
        const percentMatch = data.startAt.match(/^(\d+(\.\d+)?)%?$/);
        if (percentMatch) {
            const percent = parseFloat(percentMatch[1]);
            if (isNaN(percent) || percent < 0 || percent > 100) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be between 0% and 100%", path: ['startAt'] });
            }
        } else {
            // Try parsing as time format
            const timeMs = parseDuration(data.startAt);
            if (timeMs === null) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid format. Use percentage (e.g., 50%) or time (e.g., 30s)", path: ['startAt'] });
            } else if (timeMs > totalDurationMs) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exceeds total duration", path: ['startAt'] });
            }
        }
    }
});

export type AnimationConfigFormData = z.infer<typeof configSchema>;