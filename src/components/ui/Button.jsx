import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    ...props
}) => {
    // Base styles: Gentle transitions, no harsh scaling, pill-like rounding for modern feel
    const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98] hover:scale-[1.02] hover:shadow-medium btn-ripple';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-soft hover:shadow-colored-primary hover:brightness-105 focus:ring-primary-500',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-soft hover:shadow-colored-secondary hover:brightness-105 focus:ring-secondary-500',
        outline: 'border border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-400',
        danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:brightness-105 shadow-soft focus:ring-red-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg font-semibold',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
