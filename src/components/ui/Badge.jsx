import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    className = '',
    ...props
}) => {
    // Pill shape with slightly more padding for modern look
    const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105 cursor-default';

    const variants = {
        default: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 ring-1 ring-neutral-200',
        success: 'bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200',
        warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200', // Adjusted to Amber for warm caution
        danger: 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200',
        info: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 ring-1 ring-cyan-200',
        primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-200',
        secondary: 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 ring-1 ring-secondary-200', // New Sand variant
    };

    return (
        <span
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
