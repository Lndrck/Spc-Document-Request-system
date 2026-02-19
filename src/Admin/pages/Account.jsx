import React, { useState, useEffect } from 'react';
import axios from 'axios';
import spcLogo from '../../assets/spclogoo.png';

const Account = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData({ 
        firstName: userData.firstName || '', 
        lastName: userData.lastName || '' 
      });
    }
  }, []);

  // Determine if user is Staff based on the presence of a department
  const isStaff = user?.department && user?.department !== "Not Assigned";
  const userRoleTitle = isStaff ? "Document Processing Staff" : "System Administrator";

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Both first name and last name are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Logic handles both adminToken and general token
      const token = localStorage.getItem('adminToken') || localStorage.getItem('staffToken') || localStorage.getItem('token');
      const response = await axios.put('/api/auth/update-profile', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb/Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h2>
            <p className="text-gray-500">Manage your personal information and system role.</p>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Green Header Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar Container */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3">
                  <img src={spcLogo} alt="SPC Logo" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-400 border-4 border-green-600 w-6 h-6 rounded-full shadow-sm"></div>
              </div>

              {/* User Identity */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
                    {userRoleTitle}
                  </span>
                  <span className="px-3 py-1 bg-black/10 backdrop-blur-md text-green-50 text-xs font-medium rounded-full">
                    ID: {user.id || '155'}
                  </span>
                </div>
              </div>

              {/* Edit Toggle (Desktop) */}
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="md:ml-auto px-6 py-2 bg-white text-green-700 font-bold rounded-xl shadow-md hover:bg-green-50 transition-all active:scale-95"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-50 text-green-700 border-l-4 border-green-500 rounded-r-lg text-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? formData.firstName : user.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isEditing ? 'border-green-500 ring-4 ring-green-50 outline-none' : 'border-gray-100 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? formData.lastName : user.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isEditing ? 'border-green-500 ring-4 ring-green-50 outline-none' : 'border-gray-100 bg-gray-50 text-gray-600'
                  }`}
                />
              </div>

              {/* Email Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user.email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Department - Only shows for Staff */}
              {isStaff && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Department</label>
                  <div className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-tight">
                      {user.department}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (Edit Mode) */}
            {isEditing && (
              <div className="flex justify-end items-center gap-4 mt-10 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-xs">
          SPC Document Request System • Version 2.0.1
        </p>
      </div>
    </div>
  );
};

export default Account;