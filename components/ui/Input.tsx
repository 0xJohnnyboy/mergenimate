import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, description, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={clsx(
            'w-full bg-base-200 border rounded-md px-3 py-2',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50',
            error ? 'border-error' : 'border-base-300',
            className
          )}
          {...props}
        />
        {description && !error && (
          <p className="mt-1 text-xs opacity-60">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);
