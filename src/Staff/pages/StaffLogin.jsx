import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { login, initializeAuth } from '../../services/authService';

const StaffLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const authState = initializeAuth();
    if (authState.isAuthenticated && authState.userType === 'staff') {
      navigate('/staff');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email format (must be Gmail)
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a valid Gmail address.');
      return;
    }

    // Validate password length
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }
    if (password.length <= 6) {
      setError('Password must be greater than 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        // Update authentication state
        setIsAuthenticated?.((prev) => ({
          ...prev,
          staff: true
        }));
        navigate('/staff');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{
      backgroundImage: `url(/spc.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>

      {/* Card */}
      <div className="relative z-10 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-white transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left promotional panel */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-10">
            <div className="text-center">
              <img
                src="/spclogoo.png"
                alt="SPC Logo"
                className="w-40 h-40 object-contain mx-auto transition-all duration-300 hover:scale-105"
              />
              <h2 className="mt-6 text-gray-800 font-bold text-2xl">Online Document Request System</h2>
              <p className="mt-4 text-gray-700 text-sm max-w-xs mx-auto leading-relaxed">
                Access your documents quickly and securely through San Pablo Colleges' streamlined online portal.
              </p>
              <div className="mt-8 flex justify-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-white/30"></span>
                <span className="w-2 h-2 rounded-full bg-white/60"></span>
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </div>
            </div>
          </div>

          {/* Right login panel */}
          <div className="w-full md:w-1/2 bg-white p-8 md:p-12 rounded-r-xl flex flex-col justify-center">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-green-700">STAFF LOGIN</h3>
              <p className="text-sm text-gray-500 mt-1">Effortlessly request documents online</p>
            </div>

            {error && (
              <div className="mb-6 p-3 border border-red-200 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 animate-fadeIn">
                <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.484 0l5.518 9.814A1.75 1.75 0 0 1 16.812 16H3.188a1.75 1.75 0 0 1-1.447-2.087L7.258 3.1zM9 7a1 1 0 0 0-2 0v3a1 1 0 1 0 2 0V7zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="your.email@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-800 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.2"></circle>
                    <path d="M22 12a10 10 0 0 1-10 10" strokeWidth="4"></path>
                  </svg>
                ) : null}
                <span className="font-medium">{isLoading ? 'Signing in...' : 'Login'}</span>
              </button>


              <p className="text-center text-sm text-gray-500 mt-6">
                Need assistance?{' '}
                <Link to="/help" className="text-green-600 hover:text-green-800 hover:underline transition-colors font-medium">
                  Contact support
                </Link>
              </p>

              <p className="text-center text-xs text-gray-400 mt-8">
                By logging in, you agree to our{' '}
                <a href="#" className="text-green-600 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
