import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Card from './Card';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Clean up potentially remaining styles if component unmounts
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm animate-fadeIn transition-all duration-300"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
                <div className={`
                    bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn 
                    ring-1 ring-white/10 transform transition-all flex flex-col max-h-[90vh]
                    ${className}
                `}>
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
                        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
