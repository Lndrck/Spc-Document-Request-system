import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL parameters
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 ResetPassword: Form submitted');
    setError('');
    setSuccess('');

    // Validate passwords
    if (!newPassword.trim()) {
      console.log('❌ ResetPassword: New password validation failed - empty');
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      console.log('❌ ResetPassword: New password validation failed - too short');
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log('❌ ResetPassword: Password confirmation failed');
      setError('Passwords do not match.');
      return;
    }

    console.log('✅ ResetPassword: Validation passed, attempting password reset...');
    setIsLoading(true);

    try {
      console.log('📡 ResetPassword: Calling reset password service...');
      const result = await resetPassword(token, newPassword);
      console.log('📡 ResetPassword: Reset password result:', result);

      if (result.success) {
        console.log('✅ ResetPassword: Password reset successful');
        setSuccess(result.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } else {
        console.log('❌ ResetPassword: Password reset failed:', result.message);
        setError(result.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('❌ ResetPassword: Error:', error);
      setError('Network error. Please try again.');
    } finally {
      console.log('🔄 ResetPassword: Request completed');
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(/spc.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          backgroundColor: '#f0f0f0',
          zIndex: 1,
          position: 'relative'
        }}
      >
        <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl bg-white p-8">
          <div className="text-center">
            <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
              <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.484 0l5.518 9.814A1.75 1.75 0 0 1 16.812 16H3.188a1.75 1.75 0 0 1-1.447-2.087L7.258 3.1zM9 7a1 1 0 0 0-2 0v3a1 1 0 0 0 2 0V7zm0 7a1 1 0 0 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Invalid Reset Link</p>
              <p className="text-sm mt-1">This password reset link is invalid or has expired.</p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(/spc.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        zIndex: 1,
        position: 'relative'
      }}
    >
      {/* Back to Login Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all duration-200 shadow-md"
        >
          <FaArrowLeft className="text-sm" />
          <span className="font-medium">Back to Login</span>
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl bg-white transition-all duration-300 hover:shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/spclogoo.png"
              alt="SPC Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-green-700">Reset Password</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter your new password
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 border border-green-200 bg-green-50 text-green-700 rounded-lg flex items-start gap-2 animate-fadeIn">
              <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-medium">{success}</p>
                <p className="mt-1">You will be redirected to the login page in a few seconds...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 animate-fadeIn">
              <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.484 0l5.518 9.814A1.75 1.75 0 0 1 16.812 16H3.188a1.75 1.75 0 0 1-1.447-2.087L7.258 3.1zM9 7a1 1 0 0 0-2 0v3a1 1 0 0 0 2 0V7zm0 7a1 1 0 0 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-busy={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.2"></circle>
                    <path d="M22 12a10 10 0 0 1-10 10" strokeWidth="4"></path>
                  </svg>
                ) : null}
                <span className="font-medium">
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </span>
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/admin/login" className="text-green-600 hover:text-green-800 hover:underline transition-colors font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
