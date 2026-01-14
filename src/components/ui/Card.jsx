import React from 'react';

const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    ...props
}) => {
    // Removed border, relying on shadow and slight background difference for cleaner look
    const baseStyles = 'bg-white rounded-2xl shadow-soft transition-all duration-300';

    const paddings = {
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
        none: 'p-0',
    };

    // Softer lift effect with colored shadow hint
    const hoverStyles = hover ? 'hover-lift cursor-pointer hover:shadow-medium' : '';

    return (
        <div
            className={`${baseStyles} ${paddings[padding]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
