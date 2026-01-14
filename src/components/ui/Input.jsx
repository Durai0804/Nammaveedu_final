import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    type = 'text',
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={`
          w-full px-4 py-3 text-base
          border rounded-xl bg-neutral-50
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white
          transition-all duration-300
          ${error
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                        : 'border-transparent hover:border-neutral-300 focus:shadow-soft'
                    }
          placeholder:text-neutral-400
        `}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn font-medium">{error}</p>
            )}
        </div>
    );
};

export default Input;
