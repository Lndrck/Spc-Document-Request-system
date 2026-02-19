import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { UserPlus, X, Shield, Mail, Lock, User, Building2, CheckCircle } from 'lucide-react';
import spcBackground from '../../assets/spc.png';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    firstName: '',
    lastName: '',
    departments: []  // Changed to array for multiple departments
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Load users and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No admin token found');
          navigate('/login/admin');
          return;
        }



        // Fetch departments first
        const departmentsResponse = await api.get('/departments');
        if (departmentsResponse.data.success) {
          setDepartments(departmentsResponse.data.data);
        }

        // Fetch users
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (usersResponse.data.success) {
           // Transform API data to match component structure
           const transformedUsers = usersResponse.data.users.map(user => ({
             id: user.id,
             name: `${user.first_name} ${user.last_name}`,
             email: user.email,
             role: user.role.charAt(0).toUpperCase() + user.role.slice(1), // Capitalize role
             department: user.department_name || 'Not Assigned',
             status: user.status ? 'Active' : 'Inactive',
             lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
           }));

           setUsers(transformedUsers);
         } else {
           setError(usersResponse.data.message || 'Failed to fetch users');
         }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to fetch data');

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('userType');
          navigate('/login/admin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'staff',
      firstName: '',
      lastName: '',
      departments: []  // Initialize as empty array
    });
    setFormError('');
    setShowAddForm(true);
  };


  const handleDepartmentToggle = (deptName) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(deptName)
        ? prev.departments.filter(d => d !== deptName)
        : [...prev.departments, deptName]
    }));
  };

  const handleDeactivateUser = (userId) => {
    alert(`Deactivate user ${userId} functionality will be implemented here`);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const userIdToDelete = userToDelete.id;
    
    // Close modal first
    setIsDeleteModalOpen(false);
    setUserToDelete(null);

    try {
      setFormLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await api.delete(`/admin/users/${userIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Refresh users list
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (usersResponse.data.success) {
          const transformedUsers = usersResponse.data.users.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            department: user.department_name || 'Not Assigned',
            status: user.status ? 'Active' : 'Inactive',
            lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
          }));
          setUsers(transformedUsers);
        }
        alert('User deleted successfully');
      } else {
        alert(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setUserToDelete({ id: user.id, name: user.name });
    setIsDeleteModalOpen(true);
  };

  const isFormValid = () => {
    if (showAddForm) {
      return formData.firstName.trim() &&
             formData.lastName.trim() &&
             formData.username.trim() &&
             formData.email.trim() &&
             formData.password.trim() &&
             (formData.role === 'admin' || (formData.role === 'staff' && Array.isArray(formData.departments) && formData.departments.length > 0));
    }
    if (showEditForm) {
      return formData.firstName.trim() &&
             formData.lastName.trim() &&
             formData.username.trim() &&
             formData.email.trim() &&
             (formData.role === 'admin' || (formData.role === 'staff' && Array.isArray(formData.departments) && formData.departments.length > 0));
    }
    return false;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.username.trim() || !formData.email.trim()) {
      setFormError('All fields are required');
      setFormLoading(false);
      return;
    }

    if (showAddForm && !formData.password.trim()) {
      setFormError('Password is required for new users');
      setFormLoading(false);
      return;
    }

    if (formData.role === 'staff' && (!Array.isArray(formData.departments) || formData.departments.length === 0)) {
      setFormError('At least one department is required for staff users');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const isEdit = showEditForm;

      // Build submitData with departments as array
      const dataToSubmit = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Send departments array for staff, empty for admin
        departments: formData.role === 'staff' ? formData.departments : []
      };

      // Add password only for new users
      if (showAddForm) {
        dataToSubmit.password = formData.password;
      }

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Submitting user data:', dataToSubmit);
      console.log('Departments array:', dataToSubmit.departments);
      console.log('Form role state:', formData.role);
      console.log('Available departments:', departments.map(d => ({ id: d.department_id, name: d.department_name })));
      console.log('=== END DEBUG ===');

      const response = await api({
        method: isEdit ? 'put' : 'post',
        url: isEdit ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users',
        data: dataToSubmit,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Refresh users list
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (usersResponse.data.success) {
           const transformedUsers = usersResponse.data.users.map(user => ({
             id: user.id,
             name: `${user.first_name} ${user.last_name}`,
             email: user.email,
             role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
             department: user.department,
             status: user.status ? 'Active' : 'Inactive',
             lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
           }));
           setUsers(transformedUsers);
         }

        setShowAddForm(false);
        setShowEditForm(false);
        setSelectedUser(null);
      } else {
        setFormError(response.data.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Full server response:', error.response?.data);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        validation: error.response?.data?.validation
      });
      setFormError(error.response?.data?.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedUser(null);
    setFormError('');
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesDepartment && matchesSearch;
  });

  const renderUserForm = () => (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        backgroundImage: `url(${spcBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white shadow-2xl w-full max-w-lg overflow-hidden border-2 border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {showAddForm ? 'Add New User' : 'Edit User'}
                </h3>
                <p className="text-green-100 text-sm">Fill in the user details below</p>
              </div>
            </div>
            <button
              onClick={handleFormCancel}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <X className="w-5 h-5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                  placeholder="john.doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                  placeholder="john.doe@spc.edu.ph"
                  required
                />
              </div>

              {/* Password (Add Form Only) */}
              {showAddForm && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              {/* Role */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'staff'})}
                    className={`px-4 py-3 rounded-sm border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.role === 'staff'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={`px-4 py-3 rounded-sm border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.role === 'admin'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              </div>

              {/* Departments (Staff Only) */}
              {formData.role === 'staff' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-green-600" />
                    Assigned Departments
                  </label>
                  <div className="space-y-1 p-3 border border-gray-200 rounded-sm bg-gray-50 max-h-48 overflow-y-auto">
                    {Array.isArray(departments) && departments.length > 0 ? (
                      departments.map((dep) => (
                        <label key={dep.department_id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.departments.includes(dep.department_name)}
                            onChange={() => handleDepartmentToggle(dep.department_name)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{dep.department_name}</span>
                          {formData.departments.includes(dep.department_name) && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No departments available</p>
                    )}
                  </div>
                  {formData.departments.length === 0 && formData.role === 'staff' && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      At least one department is required for staff users
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleFormCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  disabled={formLoading}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-medium hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                  disabled={formLoading || !isFormValid()}
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {showAddForm ? 'Add User' : 'Update User'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {(showAddForm || showEditForm) && renderUserForm()}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center items-start p-4 md:p-6">
          <div className="w-full max-w-7xl space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-gray-600">Manage admin and staff accounts and their permissions</p>
              </div>
              <button 
                onClick={handleAddUser}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                + Add User
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-12"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">👑</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-8"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Admin').length}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">👨‍💼</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Staff</p>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-8"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Staff').length}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Filter</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Departments</option>
                  {Array.isArray(departments) && departments.map((dep) => (
                    <option key={dep.department_id} value={dep.department_id}>
                      {dep.department_name}
                    </option>
                  ))}
                </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Accounts ({loading ? '...' : filteredUsers.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">{user.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.department || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeactivateUser(user.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Deactivate
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No accounts found</div>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-200 text-center">
            <div className="flex justify-center mb-4 text-red-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-red-600">"{userToDelete?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={formLoading}
                className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {formLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
