import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import StatisticsCard from './StatisticsCard';
import { useStatistics } from '../../hooks/useStatistics';
import axios from 'axios';
import socket from '../../services/socket';

const Dashboard = () => {
  const { statistics, loading, error } = useStatistics('admin', 5000);
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [publishedAnnouncement, setPublishedAnnouncement] = useState(null);

  // Edit modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete confirmation modal states
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);
  const [showDeleteTransactionModal, setShowDeleteTransactionModal] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

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

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Show success toast
  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
    }, 3000);
  };
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');

      // Check if user is authenticated
      if (!token) {
        console.error('No admin token found. User may not be logged in.');
        // Redirect to login or show error
        navigate('/login/admin');
        return;
      }

      try {
        // Fetch announcements
        const announcementsResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch transaction days
        const transactionsResponse = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAnnouncements(announcementsResponse.data.announcements || []);
        setTransactions(transactionsResponse.data.transactionDays || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication failed. Redirecting to login.');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('userType');
          navigate('/login/admin');
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

        setTransactions([
          {
            id: 1,
            date: "2025-01-15",
            status: "no transaction",
            message: "No in-person transactions due to office maintenance"
          },
          {
            id: 2,
            date: "2025-01-20",
            status: "limited",
            time_start: "07:00:00",
            time_end: "11:30:00",
            message: "Limited transactions available"
          }
        ]);
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch published announcement
  useEffect(() => {
    const fetchPublished = async () => {
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

    const fetchTransactions = async () => {
      const token = localStorage.getItem('adminToken');
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

    fetchPublished();
    fetchTransactions();

    // Socket listeners for real-time updates
    socket.on('announcementUpdated', fetchPublished);
    socket.on('transactionDayUpdated', fetchTransactions);

    // Cleanup listeners on unmount
    return () => {
      socket.off('announcementUpdated', fetchPublished);
      socket.off('transactionDayUpdated', fetchTransactions);
    };
  }, []);

  const handleEditAnnouncement = async () => {
    if (announcements.length === 0) {
      alert('No announcements available to edit');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
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

  const handleCreateAnnouncement = async () => {
    // Reset form for creation
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      content: ''
    });
    setFormErrors({});
    setShowAnnouncementModal(true);
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

  const handleCreateTransaction = async () => {
    // Reset form for creation
    setEditingTransaction(null);
    setTransactionForm({
      date: '',
      status: 'available',
      time_start: '',
      time_end: '',
      message: ''
    });
    setFormErrors({});
    setShowTransactionModal(true);
  };

  const handleDeleteAnnouncement = () => {
    if (announcements.length === 0) {
      alert('No announcements available to delete');
      return;
    }

    const announcementToDelete = announcements[0];
    setDeletingAnnouncement(announcementToDelete);
    setShowDeleteAnnouncementModal(true);
  };

  const handleDeleteTransaction = () => {
    if (transactions.length === 0) {
      alert('No transaction days available to delete');
      return;
    }

    const transactionToDelete = transactions[0];
    setDeletingTransaction(transactionToDelete);
    setShowDeleteTransactionModal(true);
  };

  const confirmDeleteAnnouncement = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.delete(`/api/announcements/${deletingAnnouncement.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Announcement deleted successfully!');
        setShowDeleteAnnouncementModal(false);
        setDeletingAnnouncement(null);

        // Refresh the data
        const updatedResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(updatedResponse.data.announcements || []);

        // Refresh the published announcement
        try {
          const publishedRes = await axios.get('/api/announcements/public');
          setPublishedAnnouncement(publishedRes.data.announcement);
        } catch (error) {
          console.error('Error refreshing published announcement:', error);
        }
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error deleting announcement. Please try again.');
      }
    }
  };

  const confirmDeleteTransaction = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.delete(`/api/transactions/${deletingTransaction.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Transaction day deleted successfully!');
        setShowDeleteTransactionModal(false);
        setDeletingTransaction(null);

        // Refresh the data
        const updatedResponse = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(updatedResponse.data.transactionDays || []);
      } else {
        alert('Failed to delete transaction day');
      }
    } catch (error) {
      console.error('Error deleting transaction day:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error deleting transaction day. Please try again.');
      }
    }
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
  const handleCreateAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAnnouncementForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.post('/api/announcements', announcementForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        displayToast('Announcement published successfully!');
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', content: '' });

        // Refresh the data
        const updatedResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(updatedResponse.data.announcements || []);

        // Refresh the published announcement
        try {
          const publishedRes = await axios.get('/api/announcements/public');
          setPublishedAnnouncement(publishedRes.data.announcement);
        } catch (error) {
          console.error('Error refreshing published announcement:', error);
        }
      } else {
        alert('Failed to publish announcement');
      }
    } catch (error) {
      console.error('Error publishing announcement:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error publishing announcement. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    const errors = validateAnnouncementForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.put(`/api/announcements/${editingAnnouncement.id}`, announcementForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        displayToast('Announcement updated successfully!');
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', content: '' });

        // Refresh the data
        const updatedResponse = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(updatedResponse.data.announcements || []);

        // Refresh the published announcement
        try {
          const publishedRes = await axios.get('/api/announcements/public');
          setPublishedAnnouncement(publishedRes.data.announcement);
        } catch (error) {
          console.error('Error refreshing published announcement:', error);
        }
      } else {
        alert('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error updating announcement. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateTransactionSubmit = async (e) => {
    e.preventDefault();
    const errors = validateTransactionForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.post('/api/transactions', transactionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        displayToast('Transaction day published successfully!');
        setShowTransactionModal(false);
        setEditingTransaction(null);
        setTransactionForm({ date: '', status: 'available', time_start: '', time_end: '', message: '' });

        // Refresh the data
        const updatedResponse = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(updatedResponse.data.transactionDays || []);
      } else {
        alert('Failed to publish transaction day');
      }
    } catch (error) {
      console.error('Error publishing transaction day:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error publishing transaction day. Please try again.');
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
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login again.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.put(`/api/transactions/${editingTransaction.id}`, transactionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        displayToast('Transaction day updated successfully!');
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      } else {
        alert('Error updating transaction day. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content in Container */}
        <div className="flex-1 flex justify-center items-start p-4 md:p-6">
          <div className="w-full max-w-7xl">
            {/* Statistics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatisticsCard
                  title="Total Processing"
                  value={statistics.totalProcessing}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Pending"
                  value={statistics.totalPending}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Released"
                  value={statistics.totalReleased}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Decline"
                  value={statistics.totalDecline}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Ready for Pickup"
                  value={statistics.totalReadyForPickup}
                  color="purple"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Requests"
                  value={statistics.totalRequests}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Student Requests"
                  value={statistics.totalStudent}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />
                <StatisticsCard
                  title="Total Alumni Requests"
                  value={statistics.totalAlumni}
                  color="emerald"
                  loading={loading}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
              {/* Announcement Board */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-yellow-400 px-4 py-3">
                  <h3 className="text-lg font-semibold text-gray-900">Announcement Board</h3>
                </div>
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  <p className="text-sm font-medium text-gray-700 mb-4">Currently Published:</p>
                  <div className="text-sm text-gray-600 space-y-3 flex-grow">
                    {publishedAnnouncement ? (
                      <p className="whitespace-pre-wrap">{publishedAnnouncement.content}</p>
                    ) : (
                      <p>No announcements published yet.</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 mt-auto">
                    <button
                      onClick={handleEditAnnouncement}
                      disabled={announcements.length === 0}
                      className="bg-yellow-400 text-gray-900 px-4 py-2 rounded font-medium hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteAnnouncement}
                      disabled={announcements.length === 0}
                      className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleCreateAnnouncement}
                      className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Days */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-yellow-400 px-4 py-3">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Days</h3>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm font-medium text-gray-700 mb-4">Next Available Transaction Day:</p>
                  <div className="text-sm text-gray-600 space-y-3 flex-grow">
                    {transactions.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{new Date(transactions[0].date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transactions[0].status === 'available' ? 'bg-green-100 text-green-800' :
                            transactions[0].status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transactions[0].status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {transactions[0].time_start && transactions[0].time_end && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Time:</span>
                            <span>{transactions[0].time_start} - {transactions[0].time_end}</span>
                          </div>
                        )}
                        {transactions[0].message && (
                          <div className="mt-2">
                            <span className="font-medium">Message:</span>
                            <p className="mt-1 italic">{transactions[0].message}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>No transaction days available.</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 mt-auto">
                    <button
                      onClick={handleEditTransaction}
                      disabled={transactions.length === 0}
                      className="bg-yellow-400 text-gray-900 px-4 py-2 rounded font-medium hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteTransaction}
                      disabled={transactions.length === 0}
                      className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleCreateTransaction}
                      className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncementSubmit} className="p-6 space-y-4">
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
                      {editingAnnouncement ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? 'Edit Transaction Day' : 'Create Transaction Day'}
              </h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransactionSubmit} className="p-6 space-y-4">
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
                      {editingTransaction ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingTransaction ? 'Update Transaction Day' : 'Publish Transaction Day'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation Modal */}
      {showDeleteAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Announcement
              </h2>
              <button
                onClick={() => setShowDeleteAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle size={48} className="text-red-500 mr-4" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Are you sure you want to delete this announcement?
                  </p>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. The announcement will be permanently removed from the system.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAnnouncement}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Transaction Day
              </h2>
              <button
                onClick={() => setShowDeleteTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle size={48} className="text-red-500 mr-4" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Are you sure you want to delete this transaction day?
                  </p>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. The transaction day will be permanently removed from the system.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteTransactionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTransaction}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Transaction Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
