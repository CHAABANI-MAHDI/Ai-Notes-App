import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[var(--app-bg)] disabled:opacity-50 disabled:pointer-events-none select-none relative overflow-hidden active:scale-[0.98]";
  
  const variants = {
    // White-filled primary button
    primary: "bg-white text-primary-700 shadow-teal-md hover:shadow-teal-lg hover:bg-primary-50 border-[1.5px] border-primary-200/60 hover:border-primary-300 hover:-translate-y-0.5 dark:bg-white dark:text-primary-700 dark:border-primary-300 dark:hover:bg-primary-50",
    
    // Frosted glass secondary
    secondary: "bg-white/20 backdrop-blur-sm text-primary-700 border-2 border-white/40 shadow-teal-sm hover:bg-white/30 hover:border-white/60 hover:-translate-y-0.5 dark:text-primary-300 dark:border-primary-700/40 dark:hover:border-primary-600/60",
    
    // Outline
    outline: "border-[1.5px] border-primary-300/60 bg-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-400 transition-all duration-150 dark:border-primary-700/50 dark:text-primary-400 dark:hover:bg-primary-950/30 dark:hover:border-primary-600",
    
    // Ghost
    ghost: "bg-transparent text-slate-600 hover:bg-primary-50/50 hover:text-primary-700 transition-colors dark:text-slate-300 dark:hover:bg-primary-950/20 dark:hover:text-primary-300",
    
    // Danger
    danger: "bg-rose-50 text-rose-600 border-[1.5px] border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-teal-sm dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/60",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};