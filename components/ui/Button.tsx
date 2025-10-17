import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantClasses = {
  primary: 'bg-brand-primary text-white hover:bg-brand-secondary',
  secondary: 'bg-gray-700 text-white hover:bg-brand-secondary',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  return (
    <button
      className={clsx(
        'px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2',
        'disabled:bg-gray-600 disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
