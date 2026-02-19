import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, FileIcon, Search, CheckCircle } from 'lucide-react';
import { useRequest } from '../hooks/useRequest';

/* =======================
   Progress Bar Component
======================= */
const ProgressBar = ({ currentStep }) => {
  const steps = [
    { step: 1, label: 'Privacy Notice' },
    { step: 2, label: 'Request Form' },
    { step: 3, label: 'Summary & Submit' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        {steps.map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${s.step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'}`}
              >
                {s.step}
              </div>
              <span className="text-xs mt-1 hidden sm:block text-center">
                {s.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2
                  ${s.step < currentStep ? 'bg-green-600' : 'bg-gray-300'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* =======================
        Step 1 Page
======================= */
const Step1 = () => {
  const navigate = useNavigate();
  const { agreedToPrivacy, setAgreedToPrivacy, nextStep } = useRequest();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-6">
      <div className="w-full max-w-5xl px-4 sm:px-6 flex flex-col gap-4">

        {/* Progress Bar */}
        <ProgressBar currentStep={1} />

        {/* Steps Section */}
        <section className="flex flex-col gap-2 items-center text-center">
          <h2 className="text-xl font-bold text-center">
            Steps to Request a Document
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: FileIcon,
                title: 'Fill Out the Request Form',
                desc: 'Provide required information.'
              },
              {
                icon: FileText,
                title: 'Submit Request',
                desc: 'Review and submit the form.'
              },
              {
                icon: Search,
                title: 'Track Status',
                desc: 'Receive a tracking code.'
              },
              {
                icon: CheckCircle,
                title: 'Get Confirmation',
                desc: 'Receive confirmation email.'
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center gap-2 shadow-sm h-full"
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <Icon className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#00823E]">
                  {title}
                </h3>
                <p className="text-xs text-gray-600 leading-snug">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Privacy Section */}
        <section className="flex flex-col gap-2 items-center text-center">
          <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Shield className="text-[#00823E] w-5 h-5" />
            Data Privacy Act
          </h2>

          <p className="text-sm text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
            By proceeding, you agree to the collection and processing of your personal data
            in accordance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>.
            Your information will be used strictly for academic and administrative purposes.
          </p>

          <label className="flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="w-4 h-4"
            />
            I agree to the privacy notice.
          </label>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm font-medium"
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!agreedToPrivacy}
            className="px-5 py-2 bg-[#00823E] text-white rounded-lg text-sm font-medium
                       disabled:opacity-50 flex items-center gap-2"
          >
            <FileText size={16} />
            Next: Request Form
          </button>
        </div>

      </div>
    </div>
  );
};

export default Step1;
