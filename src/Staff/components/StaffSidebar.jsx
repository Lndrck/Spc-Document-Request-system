import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StaffSidebar = ({ style }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user info from localStorage
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Staff User';

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const navItems = [
    {
      path: '/staff',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      path: '/staff/requests',
      label: 'Document Requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/staff/account',
      label: 'Account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="bg-white shadow-lg border-r border-gray-200" style={style}>
      <div className="flex flex-col h-full justify-between">
        {/* TOP SECTION */}
        <div>
          {/* Logo and Institution Info */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-green-600 shadow-lg">
                <img
                  src="/spclogoo.png"
                  alt="San Pablo College"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-gray-900">San Pablo Colleges</h2>
                <p className="text-xs text-gray-600">Document System</p>
              </div>
            </div>

            {/* Staff Profile Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">{displayName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <div className="mt-1">
                  <span className="inline-block bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-semibold border border-green-300">
                    Staff
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 py-5 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.path}
                  className={`
                    flex items-center space-x-4 px-5 py-3 rounded-lg transition-all duration-300 group relative cursor-pointer pr-4
                    ${isActive
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg border-l-4 border-green-400 transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-md hover:scale-[1.01]'
                    }
                  `}
                  onClick={() => navigate(item.path)}
                >
                  <div className={`flex-shrink-0 transition-all duration-300
                    ${isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-green-600 group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('staffToken');
              localStorage.removeItem('userType');
              localStorage.removeItem('staffName');
              localStorage.removeItem('staffDepartment');
              window.location.href = '/login/redirect';
            }}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-md font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">
              © 2023 San Pablo Colleges
            </p>
            <p className="text-xs text-gray-400">
              Document Request System
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;
