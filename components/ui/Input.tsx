import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, description, className, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={clsx(
            "w-full bg-gray-900 border rounded-md px-3 py-2 text-white focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50",
            error ? 'border-red-500' : 'border-gray-600',
            className
          )}
          {...props}
        />
        {description && !error && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
