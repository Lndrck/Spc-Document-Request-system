import React, { useEffect } from 'react';

/**
 * Reusable Modal Component
 * 
 * A professional, accessible modal with support for:
 * - Multiple states: loading, success, error, info
 * - Smooth animations using Tailwind transitions
 * - Centered layout with dark overlay
 * - Close button and ESC key support
 * 
 * Props:
 * - isOpen (boolean): Whether modal is visible
 * - onClose (function): Callback when modal closes
 * - title (string): Modal title
 * - message (string): Modal message
 * - state (string): 'loading' | 'success' | 'error' | 'info'
 * - ctaButton (object): Optional CTA button { label, onClick }
 * - hideCloseButton (boolean): Hide close button
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  state = 'info',
  ctaButton = null,
  hideCloseButton = false
}) => {
  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscapeKey = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // State configuration
  const stateConfig = {
    loading: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      icon: (
        <div className="flex justify-center">
          <div className="inline-flex">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      icon: (
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      icon: (
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      )
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      icon: (
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )
    }
  };

  const config = stateConfig[state] || stateConfig.info;

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Overlay - Animated Fade In/Out */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Modal Container - Animated Scale & Fade */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div
          className={`${config.bgColor} ${config.borderColor} border rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close Button */}
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Modal Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mb-4">
              {config.icon}
            </div>

            {/* Title */}
            <h3
              id="modal-title"
              className={`text-xl font-bold mb-2 ${config.titleColor}`}
            >
              {title}
            </h3>

            {/* Message */}
            <p className={`${config.messageColor} mb-6 leading-relaxed`}>
              {message}
            </p>

            {/* CTA Button (if provided) */}
            {ctaButton && (
              <button
                onClick={() => {
                  ctaButton.onClick?.();
                  onClose();
                }}
                disabled={state === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                {ctaButton.label}
              </button>
            )}

            {/* Close Button (if no CTA) */}
            {!ctaButton && (
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
