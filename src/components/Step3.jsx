import React from 'react';
import { CheckCircle, AlertCircle, Calendar, FileText, Edit, Send } from 'lucide-react';
import { useRequest } from '../hooks/useRequest';
import { useNavigate } from 'react-router-dom';

const Step3 = () => {
  const navigate = useNavigate();
  const {
    formData,
    getAdjustedDocuments,
    calculateTotal,
    handleSubmit,
    isSubmitting,
    submitError,
    referenceNumber,
    requestInfo,
    tempReferenceNumber,
    submitted
  } = useRequest();

  // Handle final submission
  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    await handleSubmit(e);
  };

  // Handle edit request - go back to step 2
  const handleEditRequest = () => {
    navigate('/request/step2');
  };

  // Progress Bar Component
  const ProgressBar = ({ currentStep }) => (
    <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto overflow-x-auto">
      <div className="flex items-center w-full">
        {[
          { step: 1, label: 'Privacy Notice' },
          { step: 2, label: 'Request Form' },
          { step: 3, label: 'Summary & Submit' }
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className={`flex flex-col items-center ${idx < 3 ? 'flex-1' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s.step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s.step}
              </div>
              <span className="text-xs mt-2 text-center hidden sm:block">{s.label}</span>
            </div>
            {idx < 2 && <div className={`h-1 flex-1 ${s.step < currentStep ? 'bg-green-600' : 'bg-gray-300'} mx-4 rounded-full`}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Show success page if submitted
  if (submitted && requestInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg mx-2 sm:mx-0">
            <div className="flex items-center">
              <CheckCircle size={24} className="mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-lg break-words">✅ Request submitted successfully!</p>
                <p className="text-sm break-all">Your reference number is <strong>{referenceNumber}</strong></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2 sm:mx-0">
            <ProgressBar currentStep={3} />
            <div className="bg-green-600 text-white p-3 sm:p-4 text-center">
              <h1 className="text-lg sm:text-xl font-bold px-2">REQUEST SUMMARY</h1>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2 px-2">Your document request has been submitted</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Request Information */}
              <div className="mb-4 sm:mb-6 px-2 sm:px-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Request Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-sm sm:text-base"><strong>Reference Number:</strong> <span className="break-all">{referenceNumber}</span></div>
                  <div className="text-sm sm:text-base"><strong>Request ID:</strong> <span className="break-all">{requestInfo.requestId}</span></div>
                  <div className="text-sm sm:text-base"><strong>Request No:</strong> <span className="break-all">{requestInfo.requestNo}</span></div>
                  <div className="text-sm sm:text-base"><strong>Status:</strong> <span className="text-green-600 font-semibold">PENDING</span></div>
                </div>
              </div>

              {/* Requester Information */}
              <div className="mb-4 sm:mb-6 px-2 sm:px-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Requester Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-sm sm:text-base"><strong>Student Number:</strong> {formData.studentNumber || 'N/A'}</div>
                  <div className="text-sm sm:text-base"><strong>Email:</strong> <span className="break-all">{formData.email}</span></div>
                  <div className="text-sm sm:text-base"><strong>Full Name:</strong> {formData.firstName} {formData.middleInitial} {formData.surname}</div>
                  <div className="text-sm sm:text-base"><strong>Contact:</strong> {formData.contactNo}</div>
                  <div className="text-sm sm:text-base"><strong>Course:</strong> {formData.course || 'N/A'}</div>
                  <div className="text-sm sm:text-base"><strong>Year Level:</strong> {formData.year || 'N/A'}</div>
                  <div className="sm:col-span-2 text-sm sm:text-base"><strong>Purpose of Request:</strong> <span className="break-words">{formData.purposeOfRequest === "Other, please specify" && formData.otherPurpose ? formData.otherPurpose : formData.purposeOfRequest}</span></div>
                </div>
              </div>

              {/* Requested Documents */}
              <div className="mb-4 sm:mb-6 px-2 sm:px-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Requested Documents</h2>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold">Document</th>
                          <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Year</th>
                          <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Semester</th>
                          <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Qty</th>
                          <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAdjustedDocuments().filter(d => d.checked && d.quantity > 0).map((doc, idx) => (
                          <tr key={doc.id || idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 p-2 sm:p-3 break-words">{doc.name}</td>
                            <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.year || "n/a"}</td>
                            <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.semester || "n/a"}</td>
                            <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.quantity}</td>
                            <td className="border border-gray-300 p-2 sm:p-3 text-center">₱{doc.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-center sm:text-right mt-3 sm:mt-4 px-2 sm:px-0">
                  <span className="text-base sm:text-lg font-bold">Total: ₱{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-800 mb-2">📋 Important Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Save these numbers:</strong> Keep your Reference Number and Request Number safe for tracking</li>
                  <li>• <strong>Processing time:</strong> Requests are typically processed within 3-5 business days</li>
                  <li>• <strong>Track your request:</strong> Use the "Track Request" page with your Reference Number</li>
                  <li>• <strong>Status updates:</strong> You'll receive email notifications when your request status changes</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 border-t border-gray-200 px-2 sm:px-0">
                <button
                  onClick={() => navigate('/track')}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-h-[48px] touch-manipulation w-full sm:w-auto"
                >
                  TRACK THIS REQUEST
                </button>
                <button
                  onClick={() => window.location.href = '/request/step1'}
                  className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors min-h-[48px] touch-manipulation w-full sm:w-auto"
                >
                  SUBMIT ANOTHER REQUEST
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2 sm:mx-0">
          <ProgressBar currentStep={3} />
          <div className="bg-green-600 text-white p-3 sm:p-4 text-center">
            <h1 className="text-lg sm:text-xl font-bold px-2">SUMMARY & SUBMIT</h1>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 px-2">Review your details and submit your request</p>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Requester Information */}
            <div className="mb-4 sm:mb-6 px-2 sm:px-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Requester Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="text-sm sm:text-base"><strong>Reference Number:</strong> <span className="break-all">{referenceNumber || tempReferenceNumber || 'N/A'}</span></div>
                <div className="text-sm sm:text-base"><strong>Student Number:</strong> {formData.studentNumber || 'N/A'}</div>
                <div className="text-sm sm:text-base"><strong>Email:</strong> <span className="break-all">{formData.email}</span></div>
                <div className="text-sm sm:text-base"><strong>Full Name:</strong> {formData.firstName} {formData.middleInitial} {formData.surname}</div>
                <div className="text-sm sm:text-base"><strong>Contact:</strong> {formData.contactNo}</div>
                <div className="text-sm sm:text-base"><strong>Course:</strong> {formData.course || 'N/A'}</div>
                <div className="text-sm sm:text-base"><strong>Year Level:</strong> {formData.year || 'N/A'}</div>
                <div className="sm:col-span-2 text-sm sm:text-base"><strong>Purpose of Request:</strong> <span className="break-words">{formData.purposeOfRequest === "Other, please specify" && formData.otherPurpose ? formData.otherPurpose : formData.purposeOfRequest}</span></div>
              </div>
            </div>

            {/* Requested Documents */}
            <div className="mb-4 sm:mb-6 px-2 sm:px-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Requested Documents</h2>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold">Document</th>
                        <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Year</th>
                        <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Semester</th>
                        <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Qty</th>
                        <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAdjustedDocuments().filter(d => d.checked && d.quantity > 0).map((doc, idx) => (
                        <tr key={doc.id || idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border border-gray-300 p-2 sm:p-3 break-words">{doc.name}</td>
                          <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.year || "n/a"}</td>
                          <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.semester || "n/a"}</td>
                          <td className="border border-gray-300 p-2 sm:p-3 text-center">{doc.quantity}</td>
                          <td className="border border-gray-300 p-2 sm:p-3 text-center">₱{doc.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-center sm:text-right mt-3 sm:mt-4 px-2 sm:px-0">
                <span className="text-base sm:text-lg font-bold">Total: ₱{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Display submit error if any */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-2 sm:mx-0">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-red-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-red-800 font-medium">Submission Error</p>
                    <p className="text-red-700 text-sm break-words">{submitError}</p>
                    {submitError.includes('Validation failed') && (
                      <p className="text-red-600 text-xs mt-2">
                        Please check all required fields and try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-800 mb-2">📋 Important Information</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Processing time: 3-5 business days</li>
                <li>• You'll receive email notifications</li>
                <li>• Track with reference number after submission</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 border-t border-gray-200 px-2 sm:px-0">
              <button
                type="button"
                onClick={handleEditRequest}
                className="bg-gray-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors min-h-[48px] touch-manipulation w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Request
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] touch-manipulation w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;
