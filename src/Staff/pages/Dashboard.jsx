import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import StatisticsCard from '../../Admin/pages/StatisticsCard';
import { useStatistics } from '../../hooks/useStatistics';
import { getCurrentUser } from '../../services/authService';
import axios from 'axios';
import socket from '../../services/socket';

const Dashboard = () => {
  const { statistics, loading, error } = useStatistics('staff', 60000);
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState('');
  const [departmentLoading, setDepartmentLoading] = useState(true);

  // Announcement and transaction state
  const [announcements, setAnnouncements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [publishedAnnouncement, setPublishedAnnouncement] = useState(null);

  // Edit modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Edit form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  });
  const [transactionForm, setTransactionForm] = useState({
    date: '',
    status: 'available',
    time_start: '',
    time_end: '',
    message: ''
  });

  // Form validation and loading states
  const [formErrors, setFormErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Function to fetch department name from the staff dashboard API
  const fetchDepartmentName = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      if (!token) {
        setDepartmentName('Not Assigned');
        setDepartmentLoading(false);
        return;
      }

      // Fetch staff dashboard data which includes department info
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.dashboard) {
        const { staffInfo } = response.data.dashboard;
        setDepartmentName(staffInfo.departments || 'Not Assigned');
      } else {
        setDepartmentName('Not Assigned');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      // Fallback to old method if API fails
      try {
        const user = getCurrentUser();
        if (!user || !user.department_id) {
          setDepartmentName('Not Assigned');
        } else {
          const deptResponse = await fetch('/api/departments');
          const deptData = await deptResponse.json();
          
          if (deptData.success) {
            const department = deptData.data.find(dept => (
              (dept.department_id || dept.id) === user.department_id
            ));
            setDepartmentName(department ? (department.department_name || department.name) : 'Not Assigned');
          } else {
            setDepartmentName('Not Assigned');
          }
        }
      } catch {
        setDepartmentName('Not Assigned');
      }
    } finally {
      setDepartmentLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentName();

    // Socket listeners for real-time updates
    socket.on('announcementUpdated', () => {
      console.log('Announcement updated - Staff Dashboard');
      // Fetch updated published announcement
      fetchPublishedAnnouncement();
    });
    socket.on('transactionDayUpdated', () => {
      console.log('Transaction day updated - Staff Dashboard');
      fetchTransactionDays();
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('announcementUpdated');
      socket.off('transactionDayUpdated');
    };
  }, []);

  // Function to fetch published announcement
  const fetchPublishedAnnouncement = async () => {
    try {
      const response = await axios.get('/api/announcements/public');
      setPublishedAnnouncement(response.data.announcement || {
        title: "Office Schedule Update",
        content: "The Office of the University Registrar will be conducting the Year-End Strategic Planning on M-Date-Date-Year."
      });
    } catch (error) {
      console.error('Error fetching published announcement:', error);
      // Set fallback announcement for development
      setPublishedAnnouncement({
        title: "Office Schedule Update",
        content: "The Office of the University Registrar will be conducting the Year-End Strategic Planning on M-Date-Date-Year."
      });
    }
  };

  // Function to fetch transaction days
  const fetchTransactionDays = async () => {
    const token = localStorage.getItem('staffToken');
    if (!token) return;

    try {
      const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactionDays || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Debug logging
  console.log('Staff Dashboard Debug:', {
    statistics,
    loading,
    error,
    hasStaffToken: !!localStorage.getItem('staffToken'),
    userType: localStorage.getItem('userType')
  });

  // Load initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('staffToken');

      // Check if user is authenticated
      if (!token) {
        console.error('No staff token found. User may not be logged in.');
        navigate('/login/staff');
        return;
      }

      try {
        // Fetch announcements for editing (staff can see announcements to edit)
        const announcementsResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAnnouncements(announcementsResponse.data.announcements || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication failed. Redirecting to login.');
          localStorage.removeItem('staffToken');
          localStorage.removeItem('userType');
          navigate('/login/staff');
          return;
        }

        // Fallback to placeholder data if API fails for other reasons
        setAnnouncements([
          {
            id: 1,
            title: "Office Schedule Update",
            content: "The Office of the University Registrar will be conducting the Year-End Strategic Planning on M-Date-Date-Year.",
            created_at: new Date().toISOString()
          }
        ]);
      }
    };

    fetchData();
    fetchPublishedAnnouncement(); // Fetch published announcement for display
    fetchTransactionDays(); // Fetch transaction days
  }, [navigate]);

  const handleEditAnnouncement = async () => {
    if (announcements.length === 0) {
      alert('No announcements available to edit');
      return;
    }

    try {
      const token = localStorage.getItem('staffToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/staff');
        return;
      }

      // Fetch the announcement directly from the database
      const announcementToEdit = announcements[0];
      const response = await axios.get(`/api/announcements/${announcementToEdit.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedAnnouncement = response.data.announcement;
      setEditingAnnouncement(fetchedAnnouncement);
      setAnnouncementForm({
        title: fetchedAnnouncement.title || '',
        content: fetchedAnnouncement.content || ''
      });
      setFormErrors({});
      setShowAnnouncementModal(true);
    } catch (error) {
      console.error('Error fetching announcement for edit:', error);
      alert('Failed to load announcement for editing. Please try again.');
    }
  };

  const handleEditTransaction = () => {
    if (transactions.length === 0) {
      alert('No transaction days available to edit');
      return;
    }

    // Get the first transaction day (or implement selection logic)
    const transactionToEdit = transactions[0];
    setEditingTransaction(transactionToEdit);
    setTransactionForm({
      date: transactionToEdit.date || '',
      status: transactionToEdit.status || 'available',
      time_start: transactionToEdit.time_start || '',
      time_end: transactionToEdit.time_end || '',
      message: transactionToEdit.message || ''
    });
    setFormErrors({});
    setShowTransactionModal(true);
  };

  // Form handling functions
  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation functions
  const validateAnnouncementForm = () => {
    const errors = {};
    if (!announcementForm.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!announcementForm.content.trim()) {
      errors.content = 'Content is required';
    }
    return errors;
  };

  const validateTransactionForm = () => {
    const errors = {};
    if (!transactionForm.date) {
      errors.date = 'Date is required';
    }
    const validStatuses = ['no transaction', 'limited', 'available'];
    if (!validStatuses.includes(transactionForm.status)) {
      errors.status = 'Invalid status selected';
    }
    return errors;
  };

  // Submit functions
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    const errors = validateAnnouncementForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('staffToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/staff');
        return;
      }

      const response = await axios.put(`/api/announcements/${editingAnnouncement.id}`, {
        title: announcementForm.title,
        content: announcementForm.content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Announcement updated successfully!');
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', content: '' });

        // Refresh the data
        const updatedResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(updatedResponse.data.announcements || []);

        // Note: Staff dashboard doesn't display published announcements
      } else {
        alert('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('staffToken');
        localStorage.removeItem('userType');
        navigate('/login/staff');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to modify this announcement.');
      } else {
        alert('Error updating announcement. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    const errors = validateTransactionForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('staffToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/staff');
        return;
      }

      const response = await axios.put(`/api/transactions/${editingTransaction.id}`, transactionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Transaction day updated successfully!');
        setShowTransactionModal(false);
        setEditingTransaction(null);
        setTransactionForm({ date: '', status: 'available', time_start: '', time_end: '', message: '' });

        // Refresh the data
        const updatedResponse = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(updatedResponse.data.transactionDays || []);
      } else {
        alert('Failed to update transaction day');
      }
    } catch (error) {
      console.error('Error updating transaction day:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('staffToken');
        localStorage.removeItem('userType');
        navigate('/login/staff');
      } else {
        alert('Error updating transaction day. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };
  

  return (
    <div className="staff-content-spacing">
            {/* Department Assignment Display */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900">
                  You are assigned to: {departmentLoading ? 'Loading...' : departmentName}
                </h2>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatisticsCard
                  title="My Pending Requests"
                  value={statistics.myPendingRequests}
                  color="yellow"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Processing Requests"
                  value={statistics.myProcessingRequests}
                  color="blue"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Released Documents"
                  value={statistics.myReleasedDocuments}
                  color="green"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Ready for Pickup"
                  value={statistics.myReadyForPickup}
                  color="purple"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>

            {/* Information Cards */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch mb-8">
              {/* Announcement Board */}
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-t-lg font-bold">
                  Announcement Board
                </div>
                
                {/* Content with flex-grow to push button to bottom */}
                <div className="p-6 flex-grow">
                  <h3 className="font-bold mb-2">Currently Published:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {publishedAnnouncement?.content || "No announcement published."}
                  </p>
                </div>

                {/* Button container always stays at the bottom */}
                <div className="p-6 pt-0 mt-auto">
                  <button 
                    onClick={handleEditAnnouncement}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Transaction Days */}
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-t-lg font-bold">
                  Transaction Days
                </div>
                {/* Content with flex-grow to match height of left card */}
                <div className="p-6 flex-grow">
                  <h3 className="font-bold mb-2">Next Available Transaction Day:</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-semibold">Date:</span> {new Date(transactions[0].date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transactions[0].status === 'available' ? 'bg-green-100 text-green-800' :
                        transactions[0].status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transactions[0].status.replace('_', ' ').toUpperCase()}
                      </span></p>
                      {transactions[0].time_start && transactions[0].time_end && (
                        <p><span className="font-semibold">Time:</span> {transactions[0].time_start} - {transactions[0].time_end}</p>
                      )}
                      {transactions[0].message && (
                        <p className="italic mt-2">{transactions[0].message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No transaction days scheduled.</p>
                  )}
                </div>

                {/* Button container aligned with the left button */}
                <div className="p-6 pt-0 mt-auto">
                  <button 
                    onClick={handleEditTransaction}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

      {/* Edit Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Announcement
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={announcementForm.title}
                  onChange={handleAnnouncementInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter announcement title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={announcementForm.content}
                  onChange={handleAnnouncementInputChange}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                  placeholder="Enter announcement content"
                />
                {formErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                )}
              </div>

              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {formErrors.general}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-400"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Update Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Transaction Day
              </h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={transactionForm.date}
                    onChange={handleTransactionInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={transactionForm.status}
                    onChange={handleTransactionInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="no transaction">No Transaction</option>
                  </select>
                  {formErrors.status && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
                  )}
                </div>
              </div>

              {(transactionForm.status === 'limited') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="time_start"
                      value={transactionForm.time_start}
                      onChange={handleTransactionInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="time_end"
                      value={transactionForm.time_end}
                      onChange={handleTransactionInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={transactionForm.message}
                  onChange={handleTransactionInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                  placeholder="Additional information about this transaction day"
                />
              </div>

              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {formErrors.general}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center disabled:bg-gray-400"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Update Transaction Day
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
