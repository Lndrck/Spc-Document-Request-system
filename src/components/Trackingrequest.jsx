import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, PackageCheck, Calendar } from 'lucide-react';
import api from '../lib/api';
import spclogoo from '../assets/spclogoo.png';
import registrarlogo from '../assets/registrarlogo.png';

const TrackingRequest = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [requestInfo, setRequestInfo] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!trackingId) {
      setError('Please enter a tracking ID');
      return;
    }
    setError('');
    setStatus([]);
    setRequestInfo(null);
    setLoading(true);
    setSearched(true);

    try {
      // Check if input matches either format
      const isReferenceNumber = trackingId.startsWith('SPC-DOC-') || trackingId.startsWith('REF-');
      const isRequestNumber = /^\d{12}$/.test(trackingId);

      if (!isReferenceNumber && !isRequestNumber) {
        throw new Error('invalid_format');
      }

      const response = await api.get(`/requests/track/${trackingId}`);

      if (response.data && response.data.request) {
        const { request, tracking } = response.data;
        
        // Format the response data
        const formattedRequest = {
          studentName: `${request.firstName} ${request.surname}`,
          studentNumber: request.studentNumber,
          referenceNumber: request.referenceNumber,
          requestNumber: request.requestNo,
          status: request.status,
          scheduledPickup: request.scheduledPickup,
          documents: request.documents.filter(doc => doc.checked).map(doc => doc.name)
        };

        setRequestInfo(formattedRequest);
        setStatus(tracking || []);
      } else {
        throw new Error('Invalid response format');
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Tracking error:', error);
      
      if (error.message === 'invalid_format') {
        setError('Invalid tracking ID format. Please enter a valid reference number (SPC-DOC-XXXXXX-XXXX or REF-XXXXXX-XXXX) or request number (12 digits).');
      } else if (error.response) {
        if (error.response.status === 404) {
          setError(`Request with ID "${trackingId}" not found. Please check and try again.`);
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(error.response.data.message || 'Failed to track request. Please try again.');
        }
      } else {
        setError('Connection error. Please check your internet connection and try again.');
      }
      
      setStatus([]);
      setRequestInfo(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!loading) handleTrack();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-28 px-4 relative overflow-hidden" style={{
      backgroundImage: 'url("../assets/spc.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-emerald-100/50"></div>
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-[90%] sm:max-w-2xl mx-auto relative z-10">
        <div className="flex justify-center items-center gap-4 mb-6">
            <img src={spclogoo} alt="SPC Logo" className="h-16 md:h-20 object-contain" />
            <img src={registrarlogo} alt="Registrar Logo" className="h-16 md:h-20 object-contain" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Track Your Request</h2>
        <p className="text-center text-gray-500 mb-6">Enter the reference number (SPC-DOC-XXXXXX-XXXX or REF-XXXXXX-XXXX) or request number (12 digits) from your confirmation email.</p>
        
        <div className="flex flex-col md:flex-row gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              key="trackingId"
              type="text"
              placeholder="e.g. SPC-DOC-123456-7890 or REF-123456-7890"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00823E]"
              aria-label="Tracking ID input"
              autoComplete="off"
            />
          </div>
          <button 
            onClick={handleTrack}
            disabled={loading}
            className={`w-full md:w-auto bg-[#00823E] text-white px-6 py-3 rounded-lg hover:bg-[#006b33] transition-colors duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Track request button"
          >
            {loading ? 'Tracking...' : 'Track Request'}
          </button>
        </div>
        
        {error && !loading && <div className="text-red-600 text-center mt-4">{error}</div>}

        <div className="border-t pt-6 mt-6">
          {loading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!loading && requestInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Student Name:</p>
                  <p className="font-medium">{requestInfo.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Student Number:</p>
                  <p className="font-medium">{requestInfo.studentNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Reference Number:</p>
                  <p className="font-medium">{requestInfo.referenceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${requestInfo.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        requestInfo.status === 'SET' ? 'bg-blue-100 text-blue-800' :
                        requestInfo.status === 'READY' ? 'bg-green-100 text-green-800' :
                        requestInfo.status === 'RECEIVED' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'}`}>
                      {requestInfo.status}
                    </span>
                  </p>
                </div>
                {requestInfo.scheduledPickup && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Scheduled Pickup:</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(requestInfo.scheduledPickup)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && status.length > 0 && (
            <div className="space-y-4">
              {status.map((item, index) => {
                const isDone = item.type === 'done';
                const isCurrent = item.type === 'current';
                const isPending = item.type === 'pending';
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1">
                      {isDone && <CheckCircle2 className="text-green-600" size={22} aria-hidden="true" />}
                      {isCurrent && <Clock className="text-amber-500" size={22} aria-hidden="true" />}
                      {isPending && <AlertCircle className="text-gray-400" size={22} aria-hidden="true" />}
                    </div>
                    <div className={`flex-1 rounded-lg border p-4 ${isDone ? 'border-green-200 bg-green-50' : isCurrent ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{item.stage}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${isDone ? 'bg-green-100 text-green-800' :
                            isCurrent ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-200 text-gray-700'}`}>
                          {isPending ? 'Pending' : isCurrent ? 'In progress' : 'Completed'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{item.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && status.length === 0 && requestInfo && (
            <div className="text-center py-8 text-gray-500">
              <PackageCheck size={40} className="mx-auto mb-4 text-gray-400" />
              <h4 className="font-semibold text-lg text-gray-700">Request Found</h4>
              <p>Your request has been submitted but no tracking updates are available yet.</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-8 text-gray-500">
                <PackageCheck size={40} className="mx-auto mb-4 text-gray-400" />
                <h4 className="font-semibold text-lg text-gray-700">Track your document request</h4>
                <p>Enter your reference number or request number above to see the latest status of your request.</p>
            </div>
          )}

          {!loading && searched && !requestInfo && (
            <div className="text-center py-8 text-gray-500">
                <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
                <h4 className="font-semibold text-lg text-gray-700">Request Not Found</h4>
                <p>Please check your tracking ID and try again. Make sure you're using the correct reference number or request number from your confirmation email.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrackingRequest;
