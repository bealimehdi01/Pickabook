import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  const sizes = "h-12 px-6 text-base";

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
      ) : null}
      {children}
    </button>
  );
}

// Card Component
export function Card({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6", className)}>
      {children}
    </div>
  );
}
