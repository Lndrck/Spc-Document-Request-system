import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertCircle, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

const ManageDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
      });
      const documentsData = response.data.documents || response.data.data || response.data || [];
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);

      let errorMessage = 'Failed to fetch documents';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Pagination logic
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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


  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Document name is required';
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }
    return errors;
  };

  // Handle add document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitLoading(true);
      await axios.post(`${API_BASE_URL}/admin/documents`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
      });

      setFormData({ name: '', price: '' });
      setShowAddForm(false);
      setFormErrors({});
      fetchDocuments();
      showToast('Document added successfully');

      // Refresh the document request form if it's open
      if (window.refreshDocumentForm) {
        window.refreshDocumentForm();
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('documentsUpdated'));
    } catch (error) {
      console.error('Error adding document:', error);

      let errorMessage = 'Failed to add document';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Document already exists.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.message || 'Failed to add document';
      }

      setFormErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit document
  const handleEditDocument = (document) => {
    setEditingId(document.id);
    setFormData({
      name: document.documentName,
      price: document.basePrice
    });
    setFormErrors({});
  };

  // Handle update document
  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitLoading(true);
      await axios.put(`${API_BASE_URL}/admin/documents/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
      });

      setEditingId(null);
      setFormData({ name: '', price: '' });
      setFormErrors({});
      fetchDocuments();
      showToast('Document updated successfully');

      // Refresh the document request form if it's open
      if (window.refreshDocumentForm) {
        window.refreshDocumentForm();
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('documentsUpdated'));
    } catch (error) {
      console.error('Error updating document:', error);

      let errorMessage = 'Failed to update document';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Document not found. It may have been deleted.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Document name already exists.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.message || 'Failed to update document';
      }

      setFormErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete document - opens modal
  const handleDeleteDocument = (id, name) => {
    setDocToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete - executes the actual deletion
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    const { id } = docToDelete;
    setDeletingDoc(true);

    try {
      await axios.delete(`${API_BASE_URL}/admin/documents/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` }
      });
      
      // Close modal first
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
      
      fetchDocuments();
      showToast('Document deleted successfully');

      // Refresh the document request form if it's open
      if (window.refreshDocumentForm) {
        window.refreshDocumentForm();
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('documentsUpdated'));
    } catch (error) {
      console.error('Error deleting document:', error);

      let errorMessage = 'Failed to delete document';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Document not found. It may have been already deleted.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Cannot delete document that is in use.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.message || 'Failed to delete document';
      }

      showToast(errorMessage, 'error');
    } finally {
      setDeletingDoc(false);
    }
  };


  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', price: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            ) : (
              <AlertCircle size={16} className="text-red-600" />
            )}
            <p className={toast.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {toast.message}
            </p>
          </div>
        </div>
      )}



      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Add Document Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Document</h2>
          <form onSubmit={handleAddDocument} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Transcript of Records"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Page (₱)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                )}
              </div>
            </div>

            {formErrors.general && (
              <p className="text-red-500 text-sm">{formErrors.general}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Add Document
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', price: '' });
                  setFormErrors({});
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List with Sidebar Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header inside container */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Documents</h1>
            <p className="text-gray-600">Manage documents and their cost per page</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Document
          </button>
        </div>

        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Get started by adding your first document.</p>
            </div>
          ) : (
            currentDocuments.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {editingId === document.id ? (
                // Edit Form
                <div className="p-6">
                  <form onSubmit={handleUpdateDocument} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost per Page (₱)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {formErrors.price && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                        )}
                      </div>
                    </div>


                    {formErrors.general && (
                      <p className="text-red-500 text-sm">{formErrors.general}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Display Mode
                <div>
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{document.documentName}</h3>
                        <p className="text-lg font-bold text-green-600 mt-1">₱{parseFloat(document.basePrice).toFixed(2)} per page</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {document.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDocument(document)}
                          className="bg-green-600 hover:bg-yellow-300 text-white p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id, document.documentName)}
                          className="bg-gray-500 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {documents.length > 0 && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, documents.length)} of {documents.length} documents
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-200 text-center">
            <div className="flex justify-center mb-4 text-red-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-red-600">"{docToDelete?.name}"</span>?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDocToDelete(null);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={deletingDoc}
                className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingDoc && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {deletingDoc ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;