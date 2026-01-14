import React from 'react';

const Skeleton = ({
    className = '',
    width,
    height,
    variant = 'text', // text, rectangular, circular
    ...props
}) => {
    const baseStyles = 'skeleton animate-pulse bg-neutral-200';

    const variants = {
        text: 'rounded',
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
    };

    const style = {
        width: width,
        height: height,
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={style}
            {...props}
        />
    );
};

export default Skeleton;
