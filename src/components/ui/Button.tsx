
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'destructive-ghost';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', ...props }, ref) => {
    const baseClasses = "relative inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:hover:-translate-y-0.5 active:translate-y-0";
    
    const variantClasses = {
        primary: "text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40",
        secondary: "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground",
        destructive: "bg-destructive/20 border border-destructive/50 text-destructive-foreground/80 hover:bg-destructive/40 hover:text-destructive-foreground hover:border-destructive/70",
        'destructive-ghost': "bg-transparent text-destructive-foreground/80 hover:text-primary hover:shadow-glow-primary"
    };
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
        ref={ref}
        {...props}
      >
        {variant === 'primary' && (
            <>
                <span className="absolute inset-0 rounded-lg" style={{background: 'var(--gradient-primary)'}}></span>
                <span className="absolute inset-0 rounded-lg transition-all duration-300" style={{background: 'var(--gradient-primary-hover)', opacity: 0}}></span>
            </>
        )}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;