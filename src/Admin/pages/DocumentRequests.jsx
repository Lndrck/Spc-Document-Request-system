import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useStatisticsRefresh } from '../../hooks/useStatisticsRefresh';
import Modal from '../../components/Modal';
import reportService from '../../services/reportService';

const DocumentRequests = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDate, setSortDate] = useState(false);
  const [courseFilter, setCourseFilter] = useState('All');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Statistics refresh functionality
  const { triggerRefresh } = useStatisticsRefresh();

  // Toast notification function
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // API data state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Saving states for individual requests
  const [deletingRequests, setDeletingRequests] = useState(new Set());

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // Inline editing state
  const [editableRowId, setEditableRowId] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState(new Map());

  // Report download state
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    state: 'info', // 'loading', 'success', 'error', 'info'
    title: '',
    message: '',
    isDownloading: false
  });
  const [reportFilters] = useState({
    fromDate: reportService.getDateDaysAgo(30),
    toDate: reportService.getTodayDate()
  });


  // Helper function to map database status names to display names
  const mapStatusToDisplay = useCallback((dbStatus) => {
    const statusMap = {
      'PENDING': 'PENDING',
      'PROCESSING': 'PROCESSING',
      'READY': 'READY_FOR_PICKUP',
      'READY_FOR_PICKUP': 'READY_FOR_PICKUP',
      'RECEIVED': 'RELEASED',
      'RELEASED': 'RELEASED',
      'DECLINE': 'DECLINED',
      'DECLINED': 'DECLINED'
    };
    return statusMap[dbStatus] || dbStatus;
  }, []);

  // Helper function to get statusId from display name
  const getStatusIdFromDisplay = useCallback((displayStatus) => {
    const statusIdMap = {
      'PENDING': 1,
      'PROCESSING': 2,
      'READY_FOR_PICKUP': 3,
      'RELEASED': 4,
      'DECLINED': 5
    };
    return statusIdMap[displayStatus];
  }, []);


  // Helper function to format request data for UI
  const formatRequestForUI = useCallback((request) => ({
    ...request,
    scheduledPickup: request.scheduledPickup ? request.scheduledPickup.split('T')[0] : '',
    statusName: mapStatusToDisplay(request.statusName || request.status)
  }), [mapStatusToDisplay]);

  // Helper function to validate and clean request data
  const validateRequestData = useCallback((request) => {
    // Handle null or undefined request
    if (!request) {
      console.warn('Null or undefined request detected');
      return null;
    }

    const cleaned = { ...request };

    // Transform requester name based on requester type
    if (request.requesterType === 'student') {
      // For students: combine firstName and surname from student table
      cleaned.requesterName = [request.studentFirstName, request.studentSurname]
        .filter(Boolean)
        .join(' ') || 'Unknown';
      cleaned.contactNo = request.contactNo || 'N/A';
      cleaned.requesterEmail = request.email || 'N/A'; // Student email would need to be fetched from students table
    } else if (request.requesterType === 'alumni') {
      // For alumni: combine firstName and surname from alumni table
      cleaned.requesterName = [request.alumniFirstName, request.alumniSurname]
        .filter(Boolean)
        .join(' ') || 'Unknown';
      cleaned.contactNo = request.contactNo || 'N/A';
      cleaned.requesterEmail = request.alumniEmail || 'N/A';
    } else {
      cleaned.requesterName = 'Unknown';
      cleaned.contactNo = 'N/A';
      cleaned.requesterEmail = 'N/A';
    }

    // Set course name (use courseName from joined courses table)
    cleaned.courseName = request.courseName || request.course || 'N/A';
    
    // Set educational level (from joined courses table)
    cleaned.educationalLevel = request.educationalLevel || 'N/A';
    
    // Set department name (from joined departments table)
    cleaned.departmentName = request.departmentName || 'N/A';

    // Set purpose name (this would need to be fetched from request_purposes table based on purposeId)
    cleaned.purposeName = request.purpose || 'N/A';

    // Set document types and quantities from pipe-separated lists
    cleaned.document_list = request.document_list || null;
    cleaned.quantity_list = request.quantity_list || null;
    cleaned.documentTypes = request.document_list || 'N/A';

    // Ensure status fields are properly set
    if (!cleaned.statusName && cleaned.status) {
      cleaned.statusName = cleaned.status;
    }

    // Map database status names to frontend display names
    if (cleaned.statusName) {
      cleaned.statusName = mapStatusToDisplay(cleaned.statusName);
    }

    // Accept frontend status names - rely on mapStatusToDisplay for fallback
    if (!cleaned.statusName) {
      cleaned.statusName = mapStatusToDisplay(cleaned.status || 'PENDING');
    }

    // Validate contact number
    if (!cleaned.contactNo || cleaned.contactNo === 'M' || cleaned.contactNo === 'N/A' || cleaned.contactNo === '' || String(cleaned.contactNo).trim() === '') {
      console.warn('Invalid or missing contactNo detected:', cleaned.contactNo);
      cleaned.contactNo = 'N/A';
    } else {
      // Clean and validate the contact number
      const trimmedContactNo = String(cleaned.contactNo).trim();
      if (trimmedContactNo.length >= 7) {
        cleaned.contactNo = trimmedContactNo;
      } else {
        console.warn('Contact number too short:', trimmedContactNo);
        cleaned.contactNo = 'N/A';
      }
    }

    return cleaned;
  }, [mapStatusToDisplay]);

  // Fetch requests from API
  const fetchRequests = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found. Please log in as admin.');
        setLoading(false);
        return;
      }

      const params = {
        page,
        limit: 10,
        ...filters
      };

      console.log('Fetching requests with params:', params);
      const response = await axios.get('/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });

      console.log('Fetched requests:', response.data.data);
      if (response.data.data && response.data.data.length > 0) {
        console.log('Sample request data:', response.data.data[0]);
        console.log('Scheduled pickup field check:', {
          scheduledPickup: response.data.data[0].scheduledPickup,
          type: typeof response.data.data[0].scheduledPickup
        });
        console.log('Contact number field check:', {
          contactNo: response.data.data[0].contactNo,
          studentNumber: response.data.data[0].studentNumber,
          firstName: response.data.data[0].firstName
        });
      }

      // Validate data structure
      if (response.data.data && Array.isArray(response.data.data)) {
        // Clean and validate each request, filter out null values
        const cleanedRequests = response.data.data
          .map(validateRequestData)
          .filter(request => request !== null)
          .map(formatRequestForUI);

        setRequests(cleanedRequests);
        setPagination({
          total: response.data.data.length,
          page: parseInt(page),
          limit: response.data.limit || 10,
          pages: Math.ceil(response.data.data.length / (response.data.limit || 10))
        });
        setCurrentPage(page);
      } else {
        console.error('Invalid data structure received:', response.data);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Full error details:', error.response?.data || error.message);

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Network error. Please check if the backend server is running on port 5000.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Please check server configuration.');
      } else {
        setError(`Failed to load requests: ${error.message || 'Unknown error'}`);
      }

      // Set empty requests on error
      setRequests([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
    } finally {
      setLoading(false);
    }
  }, [validateRequestData, formatRequestForUI]);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh every 30 seconds to sync with staff updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(currentPage);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, fetchRequests]);

  const handleDownloadReport = async () => {
    // Prevent multiple simultaneous downloads
    if (reportModal.isDownloading) return;

    try {
      // Show loading modal
      setReportModal({
        isOpen: true,
        state: 'loading',
        title: 'Generating Report',
        message: 'Please wait while we generate your document request report...',
        isDownloading: true
      });

      // Get token
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Format dates as YYYY-MM-DD
      const fromDate = reportFilters.fromDate || new Date().toISOString().split('T')[0];
      const toDate = reportFilters.toDate || new Date().toISOString().split('T')[0];

      // Validate dates
      if (!reportService.isValidDate(fromDate) || !reportService.isValidDate(toDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.');
      }

      // Make direct API call with axios - Admin can download all departments
      const response = await axios.post('/api/reports/document-requests', {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          fromDate: fromDate,
          toDate: toDate
          // Admin: no departmentId = all departments
        },
        responseType: 'blob'
      });

      // Check if response is actually an error (content-type: application/json)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.message || 'Failed to generate report');
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const startDate = fromDate.replace(/-/g, '');
      const endDate = toDate.replace(/-/g, '');
      const filename = `document-request-report-${startDate}-to-${endDate}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success modal
      setReportModal({
        isOpen: true,
        state: 'success',
        title: 'Report Downloaded',
        message: `Your document request report (${fromDate} to ${toDate}) has been successfully downloaded.`,
        isDownloading: false
      });

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setReportModal(prev => ({ ...prev, isOpen: false }));
      }, 3000);

    } catch (error) {
      console.error('Report download error:', error);
      
      // Show error modal
      setReportModal({
        isOpen: true,
        state: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to generate report. Please try again.',
        isDownloading: false
      });
    }
  };

  // Handle saving inline updates
  const handleSaveRow = useCallback(async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    const updates = pendingUpdates.get(requestId);
    if (!updates || !request) return;

    const payload = {};
    if (updates.scheduledPickup !== (request.scheduledPickup || '')) {
      payload.scheduledPickup = updates.scheduledPickup || null;
    }
    if (updates.status !== request.statusName) {
      payload.statusId = getStatusIdFromDisplay(updates.status);
      if (!payload.statusId) {
        showToast('Invalid status selected', 'error');
        return;
      }
    }

    if (Object.keys(payload).length === 0) {
      setEditableRowId(null);
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');

      console.log(`[DEBUG] Updating request ${requestId}:`, payload);

      // Update status and/or scheduledPickup
      const response = await axios.put(`/api/admin/requests/${requestId}/status`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`[DEBUG] Updated row from API:`, response.data.request);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Update failed');
      }

      const updatedRequest = response.data.request;

      // Update frontend state with the API response
      setRequests(prevRequests =>
        prevRequests.map(r => (r.id === updatedRequest.id ? formatRequestForUI(updatedRequest) : r))
      );

      console.log(`✅ Frontend state updated for ID=${updatedRequest.id}`, updatedRequest);

      // Show success toast
      if (payload.statusId) {
        showToast(`Request ${requestId} status updated to ${mapStatusToDisplay(updatedRequest.statusName)}`, 'success');
      }
      if (payload.scheduledPickup !== undefined) {
        showToast(`Request ${requestId} pickup schedule updated`, 'success');
      }

      // Clear pending updates
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
      setEditableRowId(null);

      // Trigger statistics refresh after a short delay to ensure database is updated
      setTimeout(() => {
        triggerRefresh('admin');
      }, 500);

      // Refresh data after 2 seconds to ensure consistency
      setTimeout(() => {
        fetchRequests(currentPage);
      }, 2000);
    } catch (error) {
      console.error('Error saving updates:', error);

      // Handle different error types
      let errorMessage = 'Failed to update request';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request data';
      } else if (error.response?.status === 404) {
        errorMessage = 'Request not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }

      // Show error toast
      showToast(errorMessage, 'error');

      // Refresh data on error
      fetchRequests(currentPage);
    }
  }, [requests, pendingUpdates, setRequests, setEditableRowId, setPendingUpdates, showToast, getStatusIdFromDisplay, formatRequestForUI, mapStatusToDisplay, triggerRefresh, fetchRequests, currentPage]);

  const handleDeleteRequest = (requestId) => {
    // Open confirmation modal instead of window.confirm
    setRequestToDelete(requestId);
    setShowDeleteModal(true);
  };

  // Function to execute actual deletion after confirmation
  const confirmDelete = async () => {
    if (!requestToDelete) return;

    const requestId = requestToDelete;
    
    console.log('=== ADMIN REQUEST DELETION ===');
    console.log('Request ID:', requestId);
    console.log('============================');

    // Add to deleting set
    setDeletingRequests(prev => new Set([...prev, requestId]));

    // Close modal
    setShowDeleteModal(false);
    setRequestToDelete(null);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update the local state by removing the deleted request
      setRequests(prevRequests =>
        prevRequests.filter(request => request.id !== requestId)
      );

      // Trigger statistics refresh for real-time updates
      triggerRefresh('admin');
    } catch (error) {
      console.error('Error deleting request:', error);
      console.error('Error response:', error.response?.data);

      // Refresh data to revert optimistic update on error
      fetchRequests(currentPage);
    } finally {
      // Remove from deleting set
      setDeletingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Removed handler: clear scheduled pickup via inline button when in edit mode only





// Get unique courses and document types from current requests
const courses = useMemo(() => {
  if (!requests || requests.length === 0) {
    return ['All']; // Default when no requests loaded yet
  }
  try {
    const uniqueCourses = Array.from(new Set(requests.map(r => r?.course).filter(Boolean)));
    return ['All', ...uniqueCourses];
  } catch (error) {
    console.error('Error processing courses:', error);
    return ['All'];
  }
}, [requests]);

const docTypes = ['All', 'TOR', 'COC', 'COG'];

  // Helper function for case-insensitive document type matching
  const normalizeDocumentType = (docType) => {
    if (!docType) return '';
    const normalized = docType.toString().toLowerCase().trim();
    // Handle common abbreviations and variations
    if (normalized.includes('transcript') || normalized.includes('tor')) return 'tor';
    if (normalized.includes('certificate') || normalized.includes('coc')) return 'coc';
    if (normalized.includes('grade') || normalized.includes('cog')) return 'cog';
    return normalized;
  };

  // Client-side filtering logic
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Course filtering
      const courseMatch = courseFilter === 'All' ||
        (request.courseName && request.courseName.toString().toLowerCase().includes(courseFilter.toString().toLowerCase()));

      // Document type filtering
      let documentTypeMatch = true;
      if (documentTypeFilter !== 'All') {
        const requestDocTypes = request.documentTypes ? request.documentTypes.split(', ').map(dt => normalizeDocumentType(dt)) : [];
        const filterDocType = normalizeDocumentType(documentTypeFilter);
        documentTypeMatch = requestDocTypes.includes(filterDocType);
      }

      // Status filtering
      const statusMatch = statusFilter === 'All' || request.statusName === statusFilter;

      return courseMatch && documentTypeMatch && statusMatch;
    });
  }, [requests, courseFilter, documentTypeFilter, statusFilter]);

  // Handle filter changes
  const handleCourseFilterChange = useCallback((e) => {
    setCourseFilter(e.target.value);
  }, []);

  const handleDocumentTypeFilterChange = useCallback((e) => {
    setDocumentTypeFilter(e.target.value);
  }, []);


  const _getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-orange-600';
      case 'PROCESSING': return 'text-yellow-600';
      case 'READY_FOR_PICKUP': return 'text-green-600';
      case 'RELEASED': return 'text-gray-600';
      case 'DECLINED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const _getPickupIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 flex justify-center items-start p-4 md:p-6">
          <div className="w-full max-w-7xl">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">DOCUMENT REQUESTS</h2>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  You can view and update the status and pick-up schedule of the document request.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l10 0M12 7v9m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Download Report</span>
                </button>
              </div>
            </div>


            {/* Filter Controls */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Course Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={courseFilter}
                  onChange={handleCourseFilterChange}
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              {/* Document Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Type</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={documentTypeFilter}
                  onChange={handleDocumentTypeFilterChange}
                >
                  {docTypes.map(dt => (
                    <option key={dt} value={dt}>{dt === 'COG' ? 'Copy of Grade' : dt}</option>
                  ))}
                </select>
              </div>
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="RELEASED">Released</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
                <br />
                <small>Make sure the backend server is running on port 5000</small>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                Loading requests...
              </div>
            )}

            {/* Requests Table Container */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden table-responsive p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REQUEST NO.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REF NO.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REQUESTER TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STUDENT NUMBER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STUDENT NAME
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        COURSE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EDUCATIONAL LEVEL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CONTACT #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PURPOSE OF REQUEST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 min-w-40 max-w-40">
                        ALUMNI VERIFICATION
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DOCUMENT TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QUANTITY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SCHOOL YEAR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SEMESTER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TOTAL AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE REQUESTED
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SCHEDULED PICK-UP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length === 0 && !loading ? (
                      <tr>
                        <td colSpan="20" className="px-6 py-4 text-center text-gray-500">
                          No document requests found.
                        </td>
                      </tr>
                    ) : filteredRequests.map((request, index) => (
                      <tr key={`${request.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.referenceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.requesterType === 'student'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.requesterType === 'student' ? 'Student' : 'Alumni'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.studentNumber || (request.requesterType === 'alumni' ? request.graduationYear : 'N/A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requesterName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.courseName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.educationalLevel || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.contactNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs" title={request.requesterEmail}>
                          {request.requesterEmail || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs" title={request.purposeName}>
                          {request.purposeName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 w-40 min-w-40 max-w-40">
                          {request.requesterType === 'alumni' && request.verification_photo ? (
                            <div className="flex items-center space-x-1">
                              <span
                                className="text-blue-600 underline hover:text-blue-800 cursor-pointer truncate block"
                                title={`Click to view verification file: ${request.verification_photo}`}
                                onClick={() => window.open(`http://localhost:5000/uploads/${request.verification_photo}`, '_blank')}
                              >
                                👁 {request.verification_photo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs truncate block">
                              {request.requesterType === 'student' ? 'Not Applicable' : 'No photo uploaded'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 align-top" title={request.document_list}>
                          {request.document_list ? (
                            <div className="flex flex-col">
                              {request.document_list.split('|').map((name, idx) => (
                                <div key={idx} className="py-1 border-b last:border-0 text-sm">
                                  {name.trim()}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center align-top">
                          {request.quantity_list ? (
                            <div className="flex flex-col">
                              {request.quantity_list.split('|').map((qty, idx) => (
                                <div key={idx} className="py-1 border-b last:border-0 font-bold text-blue-600">
                                  {qty.trim()}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.schoolYear || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requestSemester || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{request.totalAmount ? Number(request.totalAmount).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                              <input
                              type="date"
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              value={pendingUpdates.get(request.id)?.scheduledPickup || request.scheduledPickup || ''}
                              onChange={(e) => setPendingUpdates(prev => new Map(prev.set(request.id, { ...prev.get(request.id), scheduledPickup: e.target.value })))}
                              onClick={(e) => {
                                if (e.target.value === '') {
                                  setPendingUpdates(prev => new Map(prev.set(request.id, { ...prev.get(request.id), scheduledPickup: '' })));
                                }
                              }}
                              min={(() => {
                                const today = new Date();
                                const year = today.getFullYear();
                                const month = String(today.getMonth() + 1).padStart(2, '0');
                                const day = String(today.getDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`;
                              })()}
                              disabled={editableRowId !== request.id}
                              title={(() => {
                                const currentDate = pendingUpdates.get(request.id)?.scheduledPickup || request.scheduledPickup;
                                return currentDate ? `Scheduled for: ${new Date(currentDate).toLocaleDateString()}` : 'Select pickup date';
                              })()}
                              placeholder="mm/dd/yyyy"
                            />
                            {/* Icon logic based on status */}
                            {request.statusName === 'RELEASED' && (
                              <span className="text-lg text-green-600" title="Released">✅</span>
                            )}
                            {request.statusName === 'READY_FOR_PICKUP' && (
                              <span className="text-lg text-orange-600" title="Ready for pickup">🟦</span>
                            )}
                            {request.statusName === 'PROCESSING' && (
                              <span className="text-lg text-yellow-600" title="Processing">⏳</span>
                            )}
                            {request.statusName === 'PENDING' && (
                              <span className="text-lg text-orange-600" title="Pending">⏱️</span>
                            )}
                            {request.statusName === 'DECLINED' && (
                              <span className="text-lg text-red-600" title="Declined">❌</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              value={pendingUpdates.get(request.id)?.status || request.statusName}
                              onChange={(e) => setPendingUpdates(prev => new Map(prev.set(request.id, { ...prev.get(request.id), status: e.target.value })))}
                              disabled={editableRowId !== request.id}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                              <option value="RELEASED">RELEASED</option>
                              <option value="DECLINED">DECLINED</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (editableRowId === request.id) {
                                  handleSaveRow(request.id);
                                } else {
                                  setEditableRowId(request.id);
                                  setPendingUpdates(prev => new Map(prev.set(request.id, {
                                    scheduledPickup: request.scheduledPickup || '',
                                    status: request.statusName
                                  })));
                                }
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                              title={editableRowId === request.id ? "Save changes" : "Enable editing"}
                            >
                              {editableRowId === request.id ? 'Save' : 'Update'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(request.id)}
                              disabled={deletingRequests.has(request.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                              title="Delete request"
                            >
                              {deletingRequests.has(request.id) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {filteredRequests.length} of {pagination.total} requests (Page {pagination.page} of {pagination.pages})
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortDate(!sortDate)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sort by Date
                </button>
                {sortDate && (
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                      <option>-YEAR-&gt;</option>
                      <option>2023</option>
                      <option>2022</option>
                    </select>
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                      <option>-MONTH-&gt;</option>
                      <option>January</option>
                      <option>February</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchRequests(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchRequests(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === pagination.pages
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Report Modal */}
      <Modal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
        title={reportModal.title}
        message={reportModal.message}
        state={reportModal.state}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop with blur effect */}
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40"
            onClick={() => {
              setShowDeleteModal(false);
              setRequestToDelete(null);
            }}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Document Request
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setRequestToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-gray-600">
                  Are you sure you want to delete this document request? This action cannot be undone.
                </p>
              </div>
              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRequestToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingRequests.has(requestToDelete)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingRequests.has(requestToDelete) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {deletingRequests.has(requestToDelete) ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentRequests;
