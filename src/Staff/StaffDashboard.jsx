import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import Dashboard from './pages/Dashboard';
import DocumentRequests from './pages/DocumentRequests';
import Account from './pages/Account';

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <StaffSidebar />

        <main className="flex-1 lg:ml-72 overflow-x-hidden">
          <div className="p-4 md:p-6">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
