import axios from 'axios';

/**
 * Report Service - Handles all report-related API calls
 * 
 * Provides:
 * - PDF report generation and download
 * - Department list fetching
 * - Error handling with proper messages
 * - JWT token management
 */

const API_BASE_URL = '/api/reports';

/**
 * Get JWT token from localStorage
 * Supports both admin and staff tokens
 */
const getAuthToken = () => {
  const adminToken = localStorage.getItem('adminToken');
  const staffToken = localStorage.getItem('staffToken');
  return adminToken || staffToken;
};

/**
 * Download document request report PDF
 * 
 * @param {Object} options - Download options
 * @param {string} options.fromDate - Start date (YYYY-MM-DD)
 * @param {string} options.toDate - End date (YYYY-MM-DD)
 * @param {number} options.departmentId - Department ID (optional for admin, required for staff)
 * @returns {Promise<Blob>} PDF file as blob
 * @throws {Error} Throws error with appropriate message
 */
export const downloadDocumentReport = async (options = {}) => {
  try {
    const { fromDate, toDate, departmentId } = options;

    // Validate required parameters
    if (!fromDate || !toDate) {
      throw new Error('Date range is required (fromDate and toDate)');
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('fromDate', fromDate);
    params.append('toDate', toDate);
    
    if (departmentId) {
      params.append('departmentId', departmentId);
    }

    // Get token
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    // Make POST request with blob response type
    const response = await axios.post(
      `${API_BASE_URL}/document-requests?${params.toString()}`,
      null, // No body needed for POST request with query params
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // Important: Get response as blob for PDF
      }
    );

    // Check if response is actually a PDF (by content type)
    const contentType = response.headers['content-type'];
    
    // If response is JSON error (content-type: application/json), parse and throw
    if (contentType && contentType.includes('application/json')) {
      const text = await response.data.text();
      const error = JSON.parse(text);
      throw new Error(error.message || 'Failed to generate report');
    }

    // Return the blob
    return response.data;

  } catch (error) {
    // Handle specific error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data?.message || 'Invalid parameters. Check date format (YYYY-MM-DD) and department.');
        case 401:
          throw new Error('Your session has expired. Please login again.');
        case 403:
          throw new Error('You do not have permission to access this report. Check your department assignment.');
        case 404:
          throw new Error('Department or resource not found.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data?.message || 'Failed to generate report');
      }
    } else if (error.request) {
      throw new Error('No response from server. Check your connection.');
    } else {
      throw error;
    }
  }
};

/**
 * Get list of available departments for current user
 * 
 * For Admin: Returns all departments
 * For Staff: Returns only assigned departments
 * 
 * @returns {Promise<Array>} Array of department objects
 * @throws {Error} Throws error with appropriate message
 */
export const getAvailableDepartments = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await axios.get(
      `${API_BASE_URL}/departments`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data?.departments || [];

  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          throw new Error('Your session has expired. Please login again.');
        case 403:
          throw new Error('You do not have permission to view departments.');
        default:
          throw new Error(data?.message || 'Failed to fetch departments');
      }
    } else if (error.request) {
      throw new Error('No response from server. Check your connection.');
    } else {
      throw error;
    }
  }
};

/**
 * Utility: Trigger file download in browser
 * 
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
export const triggerFileDownload = (blob, filename = 'document-request-report.pdf') => {
  // Create blob URL
  const url = window.URL.createObjectURL(blob);
  
  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up blob URL
  window.URL.revokeObjectURL(url);
};

/**
 * Validate dates in YYYY-MM-DD format
 * 
 * @param {string} dateString - Date to validate
 * @returns {boolean} True if valid
 */
export const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Format today's date to YYYY-MM-DD
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date by subtracting days
 * 
 * @param {number} daysAgo - Number of days to subtract
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateDaysAgo = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default {
  downloadDocumentReport,
  getAvailableDepartments,
  triggerFileDownload,
  isValidDate,
  getTodayDate,
  getDateDaysAgo
};
