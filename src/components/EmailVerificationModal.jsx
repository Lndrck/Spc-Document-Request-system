import { useState, useEffect, useRef } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import axios from 'axios';

const EmailVerificationModal = ({ isOpen, onClose, onVerified, email, verifyOTP, setOtpCode, sendVerificationEmail, isVerifyingOTP }) => {
  const [code, setCodeState] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  // Auto-focus next input
  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCodeState(newCode);
    setError('');

    // Update the otpCode in parent context
    const codeString = newCode.join('');
    if (setOtpCode) {
      setOtpCode(codeString);
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCodeState(newCode);
    setError('');
    
    // Update the otpCode in parent context
    const codeString = newCode.join('');
    if (setOtpCode) {
      setOtpCode(codeString);
    }
  };

  // Resend code timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || !sendVerificationEmail) return;
    
    setResendTimer(60); // 60 seconds cooldown
    await sendVerificationEmail();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');

    // Use the verifyOTP function from props if provided
    if (verifyOTP) {
      await verifyOTP();
      // Check if verification was successful by checking if modal is still open
      // The verifyOTP function should update isEmailVerified state
      setTimeout(() => {
        onVerified();
        handleClose();
      }, 500);
    } else {
      // Fallback: direct API call
      try {
        const response = await axios.post(`${API_BASE_URL}/verify-email-code`, {
          email: email.trim(),
          code: verificationCode.trim()
        });

        if (response.data.success) {
          onVerified();
          handleClose();
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
        setCodeState(['', '', '', '', '', '']);
        if (setOtpCode) {
          setOtpCode('');
        }
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleClose = () => {
    setCodeState(['', '', '', '', '', '']);
    setError('');
    if (setOtpCode) {
      setOtpCode('');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-8 py-6 text-center">
          <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">EMAIL VERIFICATION</h2>
          <p className="text-green-100 text-sm mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Email display */}
          <p className="text-center text-gray-600 mb-6">
            <span className="text-gray-400 text-sm">Code sent to</span><br />
            <span className="font-medium text-gray-800">{email || 'your email'}</span>
          </p>

          {/* 6-digit input */}
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                  error 
                    ? 'border-red-300 bg-red-50 text-red-600' 
                    : 'border-gray-200 bg-gray-50 text-gray-800'
                }`}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isVerifyingOTP || code.join('').length !== 6}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isVerifyingOTP || code.join('').length !== 6
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-200'
            }`}
          >
            {isVerifyingOTP ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`w-full mt-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              resendTimer > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? '' : 'animate-spin-slow'}`} />
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationModal;
