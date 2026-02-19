import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProcessingDocument = () => {
  // Document data for the table
  const documentData = [
    {
      description: "Transcript of Records (TOR)",
      purposes: [
        "For Board Examination Purposes only",
        "For PRC Purposes only",
        "Local Employment Only",
        "For abroad / Overseas Employment only",
        "Other, please specify"
      ]
    },
    {
      description: "Certification",
      purposes: [
        "Completed Academic Requirements (CAR)",
        "Candidate for Graduation",
        "Graduated",
        "Course/Subject Description (maximum of 5 subjects per page)",
        "General Average Grade (GWA) per page",
        "Grades and Credits per semester/term"
      ]
    },
    {
      description: "Diploma",
      purposes: [
        "Kindergarten, Grade 6, SHS, College, JD, Graduate School"
      ]
    },
    {
      description: "Certified True Copy (CTC)",
      purposes: [
        "Diploma (requesting party to present the original copy)",
        "Certification in",
        "School Form 8 (Learner's Progress Report Card / Form 138-HS Card)",
        "School Form 10 (Learner's Permanent Academic Record / Form 101 HS Permanent",
        "Transcript of Records (TOR)",
        "Diploma",
        "Issued Certification"
      ]
    },
    {
      description: "Academic Records Verification",
      purposes: [
        "Institution:",
        "Private Firm",
        "Government Agency",
        "Business Process Outsourcing (BPO) Agency",
        "Abroad"
      ]
    },
    {
      description: "Second Copy of Diploma",
      purposes: [
        "For lost, damaged, or destroyed original diploma"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Documents for Request to Process
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the various documents available for processing and their specific purposes
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {documentData.map((doc, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{doc.description}</h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Available Purposes
                </h4>
                <div className="space-y-3">
                  {doc.purposes.map((purpose, purposeIndex) => (
                    <div
                      key={purposeIndex}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 leading-relaxed">{purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Important Notes</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Kindly check the stakeholder's charter for detailed procedures and timelines</li>
                <li>• All required clearances must be completed before processing</li>
                <li>• Payment of fees is required at the Cashier's Office</li>
                <li>• Return to the Records Management and Information Office after payment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingDocument;