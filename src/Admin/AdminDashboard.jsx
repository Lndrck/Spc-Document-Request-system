import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './pages/Dashboard';
import DocumentRequests from './pages/DocumentRequests';
import ManageDocuments from './pages/ManageDocuments';
import Users from './pages/Users';
import Account from './pages/Account';
import './styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout effect
  React.useEffect(() => {
    if (location.pathname === '/admin/logout') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userType');
      navigate('/login/admin');
    }
  }, [location.pathname, navigate]);

  // If authenticated, show the main dashboard with fixed sidebar and scrollable content
  return (
    <div 
      style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden' 
      }}
    >
      {/* Fixed Sidebar */}
      <div 
        style={{ 
          width: '260px', 
          minWidth: '260px', 
          flexShrink: 0, 
          height: '100vh' 
        }}
      >
        <AdminSidebar />
      </div>

      {/* Scrollable Main Content */}
      <main 
        style={{ 
          flexGrow: 1, 
          height: '100vh', 
          overflowY: 'auto', 
          backgroundColor: '#f4f7fe' 
        }}
      >
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/requests" element={<DocumentRequests />} />
            <Route path="/documents-purposes" element={<ManageDocuments />} />
            <Route path="/users" element={<Users />} />
            <Route path="/account" element={<Account />} />
            <Route path="/logout" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Logging out...</p>
                </div>
              </div>
            } />
            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-gray-600">404 - Admin Page Not Found</h1>
                <p className="text-gray-500 mt-4">The admin page you're looking for doesn't exist.</p>
                <Routes>
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
