import React, { useState } from "react";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  FileText,
  Clock,
  CreditCard,
  Search,
  AlertCircle,
  Users,
  Phone,
} from "lucide-react";

const Faq = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I submit a document request?",
      answer:
        "To submit a document request, click the 'New Request' button on the homepage, fill out the required form with your personal details and select the document type you need.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      question: "What documents are available for request?",
      answer:
        "Available documents include TOR, Certification, Diploma, CTC, Academic Records Verification, and Second Copy of Diploma.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      question: "What are the processing times for different documents?",
      answer:
        "TOR takes 16 working days, Transfer Credential takes 3 days, Certifications take 5 days, Diplomas take 6–7 days depending on accreditation status.",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      question: "Are there any fees associated with document requests?",
      answer:
        "Yes, fees vary depending on the type of document. Standard documents have base fees, while expedited processing may incur additional charges.",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      question: "How can I track the status of my request?",
      answer:
        "Click 'Track Your Request' and enter your tracking number to view the status, stage, and estimated completion date.",
      icon: <Search className="w-5 h-5" />,
    },
    {
      question: "What should I do if I encounter issues?",
      answer:
        "Check that all required fields are filled and documents are uploaded. If issues persist, contact support or visit the registrar's office.",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      question: "Who is eligible to request documents?",
      answer:
        "Current students, alumni, and former students of San Pablo Colleges are eligible, subject to specific verification requirements.",
      icon: <Users className="w-5 h-5" />,
    },
    {
      question: "How can I contact support?",
      answer:
        "Contact the Registrar's Office during office hours.",
      icon: <Phone className="w-5 h-5" />,
    },
  ];

  return (
    <div className="bg-white min-h-screen w-full">
      {/* FAQ Section */}
      <section className="pt-6 sm:pt-8 lg:pt-12 pb-8 sm:pb-12 lg:pb-20 bg-white min-h-screen w-full relative">
        {/* Solid white background overlay to ensure complete coverage */}
        <div className="absolute inset-0 bg-white z-0"></div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full mb-3 sm:mb-4 lg:mb-6 shadow-sm mx-2 sm:mx-0">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 lg:mr-3" />
              <span className="font-semibold text-xs sm:text-sm lg:text-base xl:text-lg">
                Frequently Asked Questions
              </span>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 leading-tight px-2">
              Common Questions About Document Requests
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3 lg:space-y-4 max-w-4xl mx-auto">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-2 sm:mx-0 relative z-10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 touch-manipulation min-h-[48px]"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-green-600">
                      {React.cloneElement(faq.icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-900 pr-2 leading-tight break-words">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {openFAQ === index ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-5 border-t border-gray-100">
                    <p className="text-gray-700 pt-2 sm:pt-3 lg:pt-4 text-xs sm:text-sm lg:text-base leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;
