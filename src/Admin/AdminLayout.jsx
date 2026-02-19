import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import './styles/admin.css';

const AdminLayout = () => {
  return (
    <div 
      className="admin-dashboard" 
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
        className="admin-main-content" 
        style={{ 
          flexGrow: 1, 
          height: '100vh', 
          overflowY: 'auto', 
          backgroundColor: '#f4f7fe' 
        }}
      >
        <div className="admin-content-spacing" style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
