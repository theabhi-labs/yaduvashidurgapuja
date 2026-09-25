import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const variants = {
    primary:
      'bg-maroon-700 hover:bg-maroon-800 active:bg-maroon-900 text-cream-50 focus:ring-maroon-600 shadow-sm shadow-maroon-900/20',
    secondary:
      'bg-cream-300 hover:bg-cream-400 active:bg-cream-500 text-dark-900 focus:ring-cream-400 border border-cream-400/60',
    gold:
      'bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-dark-950 font-semibold focus:ring-gold-400 shadow-sm shadow-gold-700/20',
    outline:
      'border-2 border-maroon-700/40 text-maroon-800 hover:bg-maroon-50 focus:ring-maroon-600 bg-transparent',
    danger:
      'bg-red-700 hover:bg-red-800 text-white focus:ring-red-600',
    ghost:
      'text-dark-800 hover:bg-cream-300/60 active:bg-cream-400/60 focus:ring-cream-400 bg-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
