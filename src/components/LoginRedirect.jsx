import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import spcLogo from '../assets/spclogoo.png';
import bgImage from '../assets/spc.png';

const LoginRedirect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-32 h-32 flex items-center justify-center transform transition-all duration-300 hover:scale-105">
            <img src={spcLogo} alt="SPC Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Login Choice Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 sm:p-8">
            <h3 className="text-center text-xl font-bold text-green-700 mb-2">Choose Login Type</h3>
            <p className="text-center text-sm text-gray-500 mb-6">Select your role to continue</p>

            <div className="space-y-4">
              {/* Staff Login Button */}
              <button
                onClick={() => navigate('/login/staff')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Staff Login</span>
              </button>

              {/* Admin Login Button */}
              <button
                onClick={() => navigate('/login/admin')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin Login</span>
              </button>
            </div>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-green-600 hover:text-green-800 hover:underline transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="bg-green-50/50 px-6 py-4 rounded-b-xl">
            <p className="text-center text-xs text-gray-600">
              San Pablo Colleges Document Request System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;