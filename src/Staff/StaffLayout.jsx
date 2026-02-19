import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import Dashboard from './pages/Dashboard';
import DocumentRequests from './pages/DocumentRequests';
import Account from './pages/Account';
import './styles/staff.css';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="staff-dashboard staff-layout-container">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar - fixed width, flex-shrink-0 */}
      <aside className={`staff-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <StaffSidebar style={{ height: '100vh', width: '260px' }} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - flex-grow, independently scrollable */}
      <main className="staff-main-content staff-content-spacing">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<DocumentRequests />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-gray-600">404 - Staff Page Not Found</h1>
              <p className="text-gray-500 mt-4">The staff page you're looking for doesn't exist.</p>
              <Navigate to="/staff/dashboard" replace />
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default StaffLayout;
