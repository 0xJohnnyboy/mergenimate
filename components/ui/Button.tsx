import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantClasses = {
  primary: 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-800',
  secondary: 'bg-gray-700 text-white hover:bg-brand-secondary focus:ring-2 focus:ring-brand-secondary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500',
};

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  return (
    <button
      className={clsx(
        'px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
        'disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
