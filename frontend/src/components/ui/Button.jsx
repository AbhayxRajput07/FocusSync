import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-accent text-white hover:brightness-110 shadow-glow",
    outline: "border-2 border-accent text-accent hover:bg-accent/10 hover:shadow-glow",
    danger: "bg-danger text-white hover:brightness-110",
    ghost: "text-muted hover:text-primary hover:bg-surface",
  };
  
  const sizes = {
    default: "h-12 px-6 py-2",
    sm: "h-9 px-4 text-sm rounded-lg",
    lg: "h-14 px-8 text-lg rounded-2xl",
    icon: "h-12 w-12",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";
