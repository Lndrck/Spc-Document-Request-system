import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Minus, AlertCircle } from 'lucide-react';
import spcBackground from '../assets/spc.png';
import { useRequest } from '../hooks/useRequest';
import { EmailVerificationModal } from './index';

const Step2 = () => {
  const {
    formData,
    handleInputChange,
    handleDocCheck,
    handleQuantityChange,
    handleDocumentChange,
    handleAlumniFileChange,
    documentsLoading,
    departments,
    fieldErrors,
    submitError,
    nextStep,
    prevStep,
    calculateTotal,
    getAdjustedDocuments,
    tempReferenceNumber,
    // Email verification
    isEmailVerified,
    isSendingVerification,
    emailVerificationError,
    sendVerificationEmail,
    verifyOTP,
    setOtpCode,
    isVerifyingOTP
  } = useRequest();

  // Modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFileSizeModal, setShowFileSizeModal] = useState(false);

  // Local state for filtered departments based on year level
  const [availableDepartments, setAvailableDepartments] = React.useState([]);

  // Initialize available departments
  useEffect(() => {
    setAvailableDepartments(departments);
  }, [departments]);


  // Helper function to get document-specific errors
  const getDocumentError = (docIndex, field) => {
    return fieldErrors[`document_${docIndex}_${field}`];
  };

  // Function to get course options based on requester type and year level
  const getCourseOptions = () => {
    if (formData.requesterType === 'Alumni') {
      return [
        // Early Education (Kinder)
        { value: 'Kinder', label: 'Kinder' },
        // Elementary (Grade 1-6)
        { value: 'Grade 1', label: 'Grade 1' },
        { value: 'Grade 2', label: 'Grade 2' },
        { value: 'Grade 3', label: 'Grade 3' },
        { value: 'Grade 4', label: 'Grade 4' },
        { value: 'Grade 5', label: 'Grade 5' },
        { value: 'Grade 6', label: 'Grade 6' },
        // Junior High School (Grade 7-10)
        { value: 'Grade 7', label: 'Grade 7' },
        { value: 'Grade 8', label: 'Grade 8' },
        { value: 'Grade 9', label: 'Grade 9' },
        { value: 'Grade 10', label: 'Grade 10' },
        // Senior High strands
        { value: 'Academic Track', label: 'Academic Track' },
        { value: 'GAS', label: 'General Academic Strand (GAS)' },
        { value: 'ABM', label: 'Accountancy, Business and Management (ABM)' },
        { value: 'STEM', label: 'Science, Technology, Engineering & Mathematics (STEM)' },
        { value: 'HUMSS', label: 'Humanities and Social Sciences (HUMSS)' },
        // College programs
        { value: 'BS Psych', label: 'BS Psychology (BS Psych)' },
        { value: 'BSA', label: 'BS Accountancy (BSA)' },
        { value: 'BECEd', label: 'Bachelor of Early Childhood Education (BECEd)' },
        { value: 'BSN', label: 'BS Nursing (BSN)' },
        { value: 'BSCS', label: 'BS Computer Science (BSCS)' },
        { value: 'BSIT', label: 'BS Information Technology (BSIT)' },
        { value: 'BSPT', label: 'BS Physical Therapy (BSPT)' },
        { value: 'BSRT', label: 'BS Radiologic Technology (BSRT)' },
        { value: 'BSHM', label: 'BS Hospitality Management (BSHM)' },
        { value: 'ARadTech', label: 'ARadTech – 3 years' },
        { value: 'ACT', label: 'ACT – 2 years' },
        { value: 'CTP', label: 'Certificate in Teaching Program (CTP)' },
        // Graduate programs
        { value: 'MAEM', label: 'MA in Educational Management (MAEM)' },
        { value: 'M.A. Engl.', label: 'MA in English (M.A. Engl.)' },
        { value: 'M.A. Fil.', label: 'MA in Filipino (M.A. Fil.)' },
        { value: 'M.A.C', label: 'MA in Counseling (M.A.C)' },
        { value: 'MAN', label: 'MA in Nursing (MAN) – Nursing Administration' },
        { value: 'MBA', label: 'Master in Business Administration (MBA) – Thesis / Non-Thesis' },
        { value: 'Ed.D', label: 'Doctor of Education (Ed.D) – Educational Management' },
        { value: 'DBA', label: 'Doctor in Business Administration (DBA)' },
        // JD
        { value: 'J.D', label: 'Juris Doctor (J.D)' }
      ];
    }

    // For Students
    // K-10 levels - course is not applicable, will be handled separately
    if (['Grade 11', 'Grade 12'].includes(formData.year)) {
      return [
        { value: 'Academic Track', label: 'Academic Track' },
        { value: 'GAS', label: 'General Academic Strand (GAS)' },
        { value: 'ABM', label: 'Accountancy, Business and Management (ABM)' },
        { value: 'STEM', label: 'Science, Technology, Engineering & Mathematics (STEM)' },
        { value: 'HUMSS', label: 'Humanities and Social Sciences (HUMSS)' }
      ];
    } else if (['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(formData.year)) {
      return [
        { value: 'BSCS', label: 'BS Computer Science (BSCS)' },
        { value: 'BSIT', label: 'BS Information Technology (BSIT)' },
        { value: 'ACT', label: 'ACT – 2 years' },
        { value: 'BSBA', label: 'BS Business Administration (BSBA)' },
        { value: 'BS Entrep', label: 'BS Entrepreneurship (BS Entrep)' },
        { value: 'BSREM', label: 'BS Real Estate Management (BSREM)' },
        { value: 'BSHM', label: 'BS Hospitality Management (BSHM)' },
        { value: 'BA Comm', label: 'BA Communication (BA Comm)' },
        { value: 'ABEL', label: 'AB English Language (ABEL)' },
        { value: 'AB PolSci', label: 'AB Political Science (AB PolSci)' },
        { value: 'BS Math', label: 'BS Mathematics (BS Math)' },
        { value: 'BS Psych', label: 'BS Psychology (BS Psych)' },
        { value: 'BS PubAd', label: 'BS Public Administration (BS PubAd)' },
        { value: 'BEEd', label: 'Bachelor of Elementary Education (BEEd)' },
        { value: 'BSEd', label: 'Bachelor of Secondary Education (BSEd)' },
        { value: 'BTLE', label: 'Bachelor of Technology and Livelihood Education (BTLE)' },
        { value: 'BPED', label: 'Bachelor of Physical Education (BPED)' },
        { value: 'BSNEd', label: 'Bachelor of Special Needs Education (BSNEd)' },
        { value: 'BECEd', label: 'Bachelor of Early Childhood Education (BECEd)' },
        { value: 'CTP', label: 'Certificate in Teaching Program (CTP)' },
        { value: 'BSN', label: 'BS Nursing (BSN)' },
        { value: 'BSA', label: 'BS Accountancy (BSA)' },
        { value: 'BSPT', label: 'BS Physical Therapy (BSPT)' },
        { value: 'BSRT', label: 'BS Radiologic Technology (BSRT)' },
        { value: 'ARadTech', label: 'ARadTech – 3 years' }
      ];
    } else if (formData.year === 'Master\'s Degrees') {
      return [
        { value: 'MAEM', label: 'MA in Educational Management (MAEM)' },
        { value: 'M.A. Engl.', label: 'MA in English (M.A. Engl.)' },
        { value: 'M.A. Fil.', label: 'MA in Filipino (M.A. Fil.)' },
        { value: 'M.A.C', label: 'MA in Counseling (M.A.C)' },
        { value: 'MAN', label: 'MA in Nursing (MAN) – Nursing Administration' },
        { value: 'MBA', label: 'Master in Business Administration (MBA) – Thesis / Non-Thesis' }
      ];
    } else if (formData.year === 'Doctoral Degrees') {
      return [
        { value: 'Ed.D', label: 'Doctor of Education (Ed.D) – Educational Management' },
        { value: 'DBA', label: 'Doctor in Business Administration (DBA)' }
      ];
    } else if (formData.year === 'Postgraduate Level') {
      return [
        { value: 'J.D', label: 'Juris Doctor (J.D)' }
      ];
    } else {
      return [
        { value: 'BSIT', label: 'BSIT - Bachelor of Science in Information Technology' },
        { value: 'BSBA', label: 'BSBA - Bachelor of Science in Business Administration' },
        { value: 'BSA', label: 'BSA - Bachelor of Science in Accountancy' },
        { value: 'BSHM', label: 'BSHM - Bachelor of Science in Hospitality Management' },
        { value: 'BEED', label: 'BEED - Bachelor of Elementary Education' },
        { value: 'BSED', label: 'BSED - Bachelor of Secondary Education' }
      ];
    }
  };

  // Direct mapping for year levels to departments (for Kinder - Grade 10)
  // Educational Level: what user sees in Educational Level dropdown
  // Department: what user sees in Department dropdown (must match department_name in DB)
  const yearLevelDepartmentMap = useMemo(() => ({
    'Kinder': { id: 4, educationalLevel: 'Basic Education', departmentName: 'Basic Education Department' },
    'Grade 1': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 2': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 3': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 4': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 5': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 6': { id: 5, educationalLevel: 'Elementary', departmentName: 'Grade School Department' },
    'Grade 7': { id: 6, educationalLevel: 'High School', departmentName: 'Junior High School Department' },
    'Grade 8': { id: 6, educationalLevel: 'High School', departmentName: 'Junior High School Department' },
    'Grade 9': { id: 6, educationalLevel: 'High School', departmentName: 'Junior High School Department' },
    'Grade 10': { id: 6, educationalLevel: 'High School', departmentName: 'Junior High School Department' }
  }), []);

  // Course mapping for educational level and department (for Students)
  const courseMapping = useMemo(() => ({
    // Senior High School (Department 7)
    'Academic Track': { educationalLevel: 'Senior High School', departmentId: 7 },
    'GAS': { educationalLevel: 'Senior High School', departmentId: 7 },
    'ABM': { educationalLevel: 'Senior High School', departmentId: 7 },
    'STEM': { educationalLevel: 'Senior High School', departmentId: 7 },
    'HUMSS': { educationalLevel: 'Senior High School', departmentId: 7 },

    // College of Computer Studies (Department 1)
    'BSCS': { educationalLevel: 'Undergraduate', departmentId: 1 },
    'BSIT': { educationalLevel: 'Undergraduate', departmentId: 1 },
    'ACT': { educationalLevel: 'Undergraduate', departmentId: 1 },

    // College of Business Administration (Department 2)
    'BSBA': { educationalLevel: 'Undergraduate', departmentId: 2 },
    'BS Entrep': { educationalLevel: 'Undergraduate', departmentId: 2 },
    'BSREM': { educationalLevel: 'Undergraduate', departmentId: 2 },
    'BSHM': { educationalLevel: 'Undergraduate', departmentId: 2 },

    // College of Arts & Sciences (Department 3)
    'BA Comm': { educationalLevel: 'Undergraduate', departmentId: 3 },
    'ABEL': { educationalLevel: 'Undergraduate', departmentId: 3 },
    'AB PolSci': { educationalLevel: 'Undergraduate', departmentId: 3 },
    'BS Psych': { educationalLevel: 'Undergraduate', departmentId: 3 },
    'BS PubAd': { educationalLevel: 'Undergraduate', departmentId: 3 },

    // College of Education (Department 9)
    'BEEd': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BSEd': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BTLE': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BPED': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BSNEd': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BECEd': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'CTP': { educationalLevel: 'Undergraduate', departmentId: 9 },

    // College of Nursing (Department 11)
    'BSN': { educationalLevel: 'Undergraduate', departmentId: 11 },

    // College of Accountancy (Department 13)
    'BSA': { educationalLevel: 'Undergraduate', departmentId: 13 },
    'BS Math': { educationalLevel: 'Undergraduate', departmentId: 13 },

    // College of Physical Therapy (Department 15)
    'BSPT': { educationalLevel: 'Undergraduate', departmentId: 15 },

    // College of Radiologic Technology (Department 16)
    'BSRT': { educationalLevel: 'Undergraduate', departmentId: 16 },
    'ARadTech': { educationalLevel: 'Undergraduate', departmentId: 16 },

    // Graduate School (Department 18)
    'MAEM': { educationalLevel: 'Graduate', departmentId: 18 },
    'M.A. Engl.': { educationalLevel: 'Graduate', departmentId: 18 },
    'M.A. Fil.': { educationalLevel: 'Graduate', departmentId: 18 },
    'M.A.C': { educationalLevel: 'Graduate', departmentId: 18 },
    'MAN': { educationalLevel: 'Graduate', departmentId: 18 },
    'MBA': { educationalLevel: 'Graduate', departmentId: 18 },

    // Graduate School (Department 18)
    'Ed.D': { educationalLevel: 'Postgraduate', departmentId: 18 },
    'DBA': { educationalLevel: 'Postgraduate', departmentId: 18 },

    // Postgraduate Degree (Department 19)
    'J.D': { educationalLevel: 'Postgraduate', departmentId: 19 },

    // Additional courses with proper mapping
    'BSIT - Bachelor of Science in Information Technology': { educationalLevel: 'Undergraduate', departmentId: 1 },
    'BSBA - Bachelor of Science in Business Administration': { educationalLevel: 'Undergraduate', departmentId: 2 },
    'BSA - Bachelor of Science in Accountancy': { educationalLevel: 'Undergraduate', departmentId: 13 },
    'BSHM - Bachelor of Science in Hospitality Management': { educationalLevel: 'Undergraduate', departmentId: 2 },
    'BEED - Bachelor of Elementary Education': { educationalLevel: 'Undergraduate', departmentId: 9 },
    'BSED - Bachelor of Secondary Education': { educationalLevel: 'Undergraduate', departmentId: 9 }
  }), []);

  // Alumni course to department mapping
  const alumniCourseMapping = useMemo(() => ({
    // Early Education (Department 4 - Basic Education Department)
    'Kinder': { departmentId: 4 },

    // Elementary (Department 5 - Grade School Department)
    'Grade 1': { departmentId: 5 },
    'Grade 2': { departmentId: 5 },
    'Grade 3': { departmentId: 5 },
    'Grade 4': { departmentId: 5 },
    'Grade 5': { departmentId: 5 },
    'Grade 6': { departmentId: 5 },

    // Junior High School (Department 6 - Junior High School Department)
    'Grade 7': { departmentId: 6 },
    'Grade 8': { departmentId: 6 },
    'Grade 9': { departmentId: 6 },
    'Grade 10': { departmentId: 6 },

    // Senior High School strands (Department 7)
    'Academic Track': { departmentId: 7 },
    'GAS': { departmentId: 7 },
    'ABM': { departmentId: 7 },
    'STEM': { departmentId: 7 },
    'HUMSS': { departmentId: 7 },

    // College of Arts & Sciences (Department 3)
    'BS Psych': { departmentId: 3 },

    // College of Accountancy (Department 13)
    'BSA': { departmentId: 13 },

    // College of Education (Department 9)
    'BECEd': { departmentId: 9 },
    'CTP': { departmentId: 9 },

    // College of Nursing (Department 11)
    'BSN': { departmentId: 11 },

    // College of Computer Studies (Department 1)
    'BSCS': { departmentId: 1 },
    'BSIT': { departmentId: 1 },

    // College of Physical Therapy (Department 15)
    'BSPT': { departmentId: 15 },

    // College of Radiologic Technology (Department 16)
    'BSRT': { departmentId: 16 },
    'ARadTech': { departmentId: 16 },
    'ACT': { departmentId: 1 }, // ACT is under CCS (Department 1)

    // College of Business Management (Department 2)
    'BSHM': { departmentId: 2 },

    // Graduate School (Department 18)
    'MAEM': { departmentId: 18 },
    'M.A. Engl.': { departmentId: 18 },
    'M.A. Fil.': { departmentId: 18 },
    'M.A.C': { departmentId: 18 },
    'MAN': { departmentId: 18 },
    'MBA': { departmentId: 18 },
    'Ed.D': { departmentId: 18 },
    'DBA': { departmentId: 18 },

    // College of Law (Department 19)
    'J.D': { departmentId: 19 }
  }), []);

  // Local handleInputChange with auto-population logic
  const handleInputChangeLocal = (e) => {
    handleInputChange(e);
  };

  // Enhanced synchronization handler for dynamic updates
  useEffect(() => {
    if (formData.requesterType === 'Student') {
      let newLevel = '';
      let newDeptId = null;
      let newCourse = formData.course;
      let newAvailableDepartments = departments; // Default to all departments

      // Logic for Kinder - Grade 10: Course dropdown shows "Not Applicable", auto-set form values
      if (['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(formData.year)) {
        // Set course to the year level (e.g., "Grade 1") for backend database lookup
        newCourse = formData.year;
        
        // Auto-populate Educational Level and Department based on year level mapping
        if (yearLevelDepartmentMap[formData.year]) {
          const mapping = yearLevelDepartmentMap[formData.year];
          newLevel = mapping.educationalLevel;
          newDeptId = mapping.id;
        }
        // For K-10, only show the mapped department with correct department name
        const k10Mapping = yearLevelDepartmentMap[formData.year];
        if (k10Mapping) {
          newAvailableDepartments = [{ id: k10Mapping.id, name: k10Mapping.departmentName }];
        } else {
          newAvailableDepartments = [{ id: null, name: 'Unknown' }];
        }
      } else {
        // Logic for SHS, College, and Grad School
        if (['Grade 11', 'Grade 12'].includes(formData.year)) {
          newLevel = 'Senior High School';
          // For SHS, department is set when course is selected
          if (formData.course && courseMapping[formData.course]) {
            newDeptId = courseMapping[formData.course].departmentId; // Use numeric ID
          }
        } else if (['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(formData.year)) {
          newLevel = 'Undergraduate';
          // For College, department is set when course is selected
          if (formData.course && courseMapping[formData.course]) {
            newDeptId = courseMapping[formData.course].departmentId; // Use numeric ID
          }
        } else if (formData.year === 'Master\'s Degrees' || formData.year === 'Doctoral Degrees') {
          newLevel = 'Graduate';
          // For Graduate, department is set when course is selected
          if (formData.course && courseMapping[formData.course]) {
            newDeptId = courseMapping[formData.course].departmentId; // Use numeric ID
          }
        } else if (formData.year === 'Postgraduate Level') {
          newLevel = 'Postgraduate';
          // For Postgraduate, department is set when course is selected
          if (formData.course && courseMapping[formData.course]) {
            newDeptId = courseMapping[formData.course].departmentId; // Use numeric ID
          }
        } else if (formData.course && courseMapping[formData.course]) {
          newLevel = courseMapping[formData.course].educationalLevel;
          newDeptId = courseMapping[formData.course].departmentId; // Use numeric ID
        }
        // For course-based levels, show all departments
        newAvailableDepartments = departments;
      }

      // Update available departments
      setAvailableDepartments(newAvailableDepartments);

      // Batch updates only if values actually differ to avoid loops
      if (newLevel && formData.educationalLevel !== newLevel) {
        handleInputChange({ target: { name: 'educationalLevel', value: newLevel } });
      }
      if (newDeptId !== null && formData.collegeDepartment !== newDeptId) {
        handleInputChange({ target: { name: 'collegeDepartment', value: newDeptId } });
      }
      if (newCourse !== formData.course) {
        handleInputChange({ target: { name: 'course', value: newCourse } });
      }
    } else if (formData.requesterType === 'Alumni') {
      // For alumni, auto-populate department when course is selected
      if (formData.course && alumniCourseMapping[formData.course]) {
        const newDeptId = alumniCourseMapping[formData.course].departmentId;
        // Only update if the department is different to avoid loops
        if (formData.collegeDepartment !== newDeptId) {
          handleInputChange({ target: { name: 'collegeDepartment', value: newDeptId } });
        }
      }
      // Show all departments in dropdown (but selected one will be auto-populated)
      setAvailableDepartments(departments);
    }
  }, [formData.year, formData.course, formData.requesterType, departments, courseMapping, formData.collegeDepartment, formData.educationalLevel, handleInputChange, yearLevelDepartmentMap, alumniCourseMapping]);

  // Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition-colors min-h-[36px] text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors min-h-[36px] text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Simple Alert Modal (single action)
  const AlertModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors min-h-[36px] text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ currentStep }) => (
    <div className="flex justify-between items-center mb-3 max-w-full overflow-x-auto px-2">
      <div className="flex items-center w-full gap-2 sm:gap-4">
        {[
          { step: 1, label: 'Privacy Notice' },
          { step: 2, label: 'Request Form' },
          { step: 3, label: 'Summary' }
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className={`flex flex-col items-center ${idx < 3 ? 'flex-1 min-w-0' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  s.step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s.step}
              </div>
              <span className="text-xs mt-1 text-center hidden sm:block whitespace-nowrap">{s.label}</span>
            </div>
            {idx < 2 && <div className={`h-0.5 flex-1 ${s.step < currentStep ? 'bg-green-600' : 'bg-gray-300'} mx-2 sm:mx-3 rounded-full`}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen flex flex-col bg-gray-50 overflow-y-auto">
      <div className="relative z-10 w-full flex flex-col px-3 sm:px-4 md:px-6 lg:px-10 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <div className="w-full flex flex-col">
            <ProgressBar currentStep={2} />
            <div className="mb-3">
              <h2 className="bg-green-600 text-white p-2 sm:p-2 rounded-lg text-center font-bold text-xs sm:text-sm lg:text-base px-2">
                REQUEST FORM
              </h2>
            </div>
            <form className="space-y-2 text-xs sm:text-sm" noValidate onSubmit={(e) => e.preventDefault()}>
              {/* Requester Type Section */}
              <div className="mb-2">
                <div className="bg-gray-50 p-2 rounded">
                  <h3 className="font-bold text-xs sm:text-sm text-center mb-2">REQUESTER TYPE</h3>
                  <div className="flex flex-row justify-center gap-3 px-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requesterType"
                        value="Student"
                        checked={formData.requesterType === 'Student'}
                        onChange={handleInputChange}
                        className="mr-1"
                      />
                      <span className="text-xs font-medium">Student</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requesterType"
                        value="Alumni"
                        checked={formData.requesterType === 'Alumni'}
                        onChange={handleInputChange}
                        className="mr-1"
                      />
                      <span className="text-xs font-medium">Alumni</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Student Info Section */}
              <div className="mb-2">
                <div className="flex flex-col gap-1 mb-2 bg-gray-50 p-2 rounded sm:bg-transparent sm:p-0">
                  <h3 className="font-bold text-xs sm:text-sm text-center px-2">REQUESTER INFORMATION</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-xs gap-1 px-2">
                    <span className="text-gray-600 text-xs">Date: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                    <span className="text-gray-600 font-semibold text-xs">Ref#: {tempReferenceNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Row 1: Student Number, Email Address, Contact No. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                  {formData.requesterType === 'Student' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Student Number <span className="text-red-500">*</span></label>
                      <input
                        key="studentNumber"
                        type="text"
                        name="studentNumber"
                        value={formData.studentNumber}
                        onChange={handleInputChange}
                        className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        required
                        autoComplete="off"
                      />
                      {fieldErrors.studentNumber && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.studentNumber}</p>}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.email}</p>}

                    {/* Email Verification Status */}
                    {formData.email && isEmailVerified && (
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Email Verified</span>
                      </div>
                    )}

                    {/* Email Verification Modal */}
                    <EmailVerificationModal
                      isOpen={showEmailModal}
                      onClose={() => setShowEmailModal(false)}
                      onVerified={() => {
                        // Verification is handled by useRequest context
                      }}
                      email={formData.email}
                      verifyOTP={verifyOTP}
                      setOtpCode={setOtpCode}
                      sendVerificationEmail={sendVerificationEmail}
                      isVerifyingOTP={isVerifyingOTP}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Contact No. <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                    {fieldErrors.contactNo && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.contactNo}</p>}
                  </div>
                </div>

                {/* Row 2: Surname, First Name, Middle Initial, Suffix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Surname <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                    {fieldErrors.surname && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.surname}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                    {fieldErrors.firstName && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.firstName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Middle Initial <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                    {fieldErrors.middleInitial && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.middleInitial}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                    {fieldErrors.suffix && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.suffix}</p>}
                  </div>
                </div>

                {/* Primary Selection Row and Automated Metadata Row */}
                {formData.requesterType === 'Student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                    {/* Row 1: Primary Selection Row */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Year Level <span className="text-red-500">*</span></label>
                      <select name="year" value={formData.year} onChange={handleInputChangeLocal} className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required>
                        <option value="">-- Select Year Level --</option>
                        <optgroup label="Early Education">
                          <option value="Kinder">Kinder</option>
                        </optgroup>
                        <optgroup label="Elementary">
                          <option value="Grade 1">Grade 1</option>
                          <option value="Grade 2">Grade 2</option>
                          <option value="Grade 3">Grade 3</option>
                          <option value="Grade 4">Grade 4</option>
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                        </optgroup>
                        <optgroup label="Junior High School">
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                        </optgroup>
                        <optgroup label="Senior High School">
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </optgroup>
                        <optgroup label="College">
                          <option value="1st Year">1st Year College</option>
                          <option value="2nd Year">2nd Year College</option>
                          <option value="3rd Year">3rd Year College</option>
                          <option value="4th Year">4th Year College</option>
                        </optgroup>
                        <optgroup label="Graduate">
                          <option value="Master's Degrees">Master's Degrees</option>
                          <option value="Doctoral Degrees">Doctoral Degrees</option>
                        </optgroup>
                        <optgroup label="Postgraduate">
                          <option value="Postgraduate Level">Postgraduate Level</option>
                        </optgroup>
                      </select>
                      {fieldErrors.year && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.year}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Course / Program <span className="text-red-500">*</span></label>
                      {['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(formData.year) ? (
                        // For K-10: Show "Not Applicable" visually, form state still holds real value
                        <input
                          type="text"
                          className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100 text-gray-500"
                          value="Not Applicable"
                          readOnly
                        />
                      ) : (
                        <select
                          name="course"
                          value={formData.course}
                          onChange={handleInputChangeLocal}
                          className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                          required
                        >
                          <option value="">--select--</option>
                          {getCourseOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                      {fieldErrors.course && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.course}</p>}
                    </div>
                    {/* Row 2: Automated Metadata Row */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Educational Level <span className="text-red-500">*</span></label>
                      <select name="educationalLevel" value={formData.educationalLevel} onChange={handleInputChange} className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required>
                        <option value="">-- Select Educational Level --</option>
                        <option value="Basic Education">Basic Education</option>
                        <option value="Elementary">Elementary</option>
                        <option value="High School">High School</option>
                        <option value="Senior High School">Senior High School</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                      {fieldErrors.educationalLevel && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.educationalLevel}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                      <select name="collegeDepartment" value={formData.collegeDepartment} onChange={handleInputChange} className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" required>
                        <option value="">-- Select Department --</option>
                        {availableDepartments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      {fieldErrors.collegeDepartment && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.collegeDepartment}</p>}
                    </div>
                  </div>
                )}

                {/* Course/Program and Department for Alumni */}
                {formData.requesterType === 'Alumni' && (
                  <div className="mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Course / Program <span className="text-red-500">*</span></label>
                        <select
                          name="course"
                          value={formData.course}
                          onChange={handleInputChange}
                          className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                          required
                        >
                          <option value="">--select--</option>
                          {getCourseOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {fieldErrors.course && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.course}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                        <select
                          name="collegeDepartment"
                          value={formData.collegeDepartment || ''}
                          onChange={handleInputChange}
                          className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">-- Select Department --</option>
                          {availableDepartments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                        {fieldErrors.collegeDepartment && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.collegeDepartment}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full-width: Purpose of Request */}
                <div className="mb-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Purpose of Request <span className="text-red-500">*</span></label>
                    <select
                      name="purposeOfRequest"
                      value={formData.purposeOfRequest}
                      onChange={handleInputChange}
                      className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      required
                    >
                      <option value="">-- Select Purpose --</option>
                      <option value="For Board Examination Purposes only">For Board Examination Purposes only</option>
                      <option value="For PRC Purposes only">For PRC Purposes only</option>
                      <option value="Local Employment Only">Local Employment Only</option>
                      <option value="For abroad / Overseas Employment only">For abroad / Overseas Employment only</option>
                      <option value="Other, please specify">Other, please specify</option>
                    </select>
                    {formData.purposeOfRequest === "Other, please specify" && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Please specify your purpose <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="otherPurpose"
                          placeholder="Enter your specific purpose here"
                          value={formData.otherPurpose || ""}
                          onChange={handleInputChange}
                          className="w-full h-8 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          required={formData.purposeOfRequest === "Other, please specify"}
                        />
                        {fieldErrors.otherPurpose && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.otherPurpose}</p>}
                      </div>
                    )}
                    {fieldErrors.purposeOfRequest && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.purposeOfRequest}</p>}
                  </div>
                </div>

                {/* Alumni Verification Section */}
                {formData.requesterType === 'Alumni' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Alumni Verification</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      As an alumni, please upload visual proof of your alumni status (e.g., Government ID is recommended).
                      Supported formats: JPEG, PNG, PDF. Max file size: 5MB.
                    </p>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload Proof Document <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Validate file type
                            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                            if (!allowedTypes.includes(file.type)) {
                              alert('Please select a valid file type (JPEG, PNG, or PDF)');
                              e.target.value = '';
                              return;
                            }
                            // Validate file size (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setShowFileSizeModal(true);
                              e.target.value = '';
                              return;
                            }
                            handleAlumniFileChange(file);
                          } else {
                            handleAlumniFileChange(null);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={formData.requesterType === 'Alumni'}
                      />
                      {formData.alumniVerificationFile && (
                        <p className="text-sm text-green-600">
                          Selected: {formData.alumniVerificationFile.name} ({(formData.alumniVerificationFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {fieldErrors.alumniVerificationFile && <p className="text-red-500 text-xs mt-1">{fieldErrors.alumniVerificationFile}</p>}
                    </div>
                  </div>
                )}


              </div>

              {/* Documents Section */}
              <div className="mt-4 sm:mt-6">
                <h3 className="font-semibold mb-2 text-xs sm:text-sm bg-gray-50 p-2 rounded sm:bg-transparent sm:p-0 px-2 sm:px-0">
                  DOCUMENTS AVAILABLE {documentsLoading && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2 px-2 sm:px-0 overflow-x-auto">
                  {documentsLoading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="inline-flex items-center gap-2 text-gray-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span>Loading documents...</span>
                      </div>
                    </div>
                  ) : getAdjustedDocuments().length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-600">No documents available. Please try refreshing the page.</p>
                    </div>
                  ) : (
                    getAdjustedDocuments().map((doc, index) => (
                    <div
                      key={doc.id || index}
                      className={`border rounded-lg p-2 shadow-sm transition-all duration-200 touch-manipulation min-h-[140px] ${
                        doc.checked ? 'border-green-500 bg-green-50 shadow-green-100' : 'border-gray-200 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={doc.checked}
                            onChange={(e) => handleDocCheck(index, e.target.checked)}
                            className="w-3 h-3 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 mt-1 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 text-xs leading-tight">{doc.name}</h4>
                            <p className="text-sm font-bold text-green-600">₱{doc.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, doc.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-xs"
                            disabled={!doc.checked || doc.quantity <= 0}
                          >
                            <Minus size={12} className="text-gray-600" />
                          </button>
                          <input
                            key={`quantity-${index}`}
                            type="number"
                            value={doc.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                            className="w-12 text-center border border-gray-300 rounded p-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min="0"
                            disabled={!doc.checked}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, doc.quantity + 1)}
                            className="w-6 h-6 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs"
                            disabled={!doc.checked}
                          >
                            <Plus size={12} className="text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Year {doc.name !== "Registration Form" && doc.name !== "Good Moral Certificate" && doc.name !== "Clearance Form" && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            key={`year-${index}`}
                            type="text"
                            value={doc.year}
                            onChange={(e) => handleDocumentChange(index, "year", e.target.value)}
                            className={`w-full border rounded p-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 ${
                              getDocumentError(index, 'year') ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={!doc.checked}
                            placeholder="Year"
                          />
                          {getDocumentError(index, 'year') && (
                            <p className="text-red-500 text-xs mt-0.5">{getDocumentError(index, 'year')}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Semester {doc.name !== "Registration Form" && doc.name !== "Good Moral Certificate" && doc.name !== "Clearance Form" && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            key={`semester-${index}`}
                            value={doc.semester}
                            onChange={(e) => handleDocumentChange(index, "semester", e.target.value)}
                            className={`w-full border rounded p-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 bg-white ${
                              getDocumentError(index, 'semester') ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={!doc.checked}
                          >
                            <option value="">--select--</option>
                            {(doc.sem_options || []).map((semester) => (
                              <option key={semester} value={semester}>{semester}</option>
                            ))}
                          </select>
                          {getDocumentError(index, 'semester') && (
                            <p className="text-red-500 text-xs mt-0.5">{getDocumentError(index, 'semester')}</p>
                          )}
                        </div>
                      </div>
                      {doc.checked && doc.quantity > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-green-600">₱{(doc.price * doc.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Total Amount:</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">₱{calculateTotal().toFixed(2)}</span>
                      <p className="text-xs text-gray-500 mt-0.5">Auto-updated</p>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message display */}
              {emailVerificationError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-xs">{emailVerificationError}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-3 px-2 sm:px-0 gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition-colors min-h-[36px] text-xs touch-manipulation w-full sm:w-auto"
                >
                  Previous
                </button>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {!isEmailVerified && !showEmailModal && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.email) {
                          alert('Please enter your email address first');
                          return;
                        }
                        setShowEmailModal(true);
                        sendVerificationEmail();
                      }}
                      disabled={!formData.email || isSendingVerification}
                      className={`btn px-3 py-2 rounded font-semibold transition-colors min-h-[36px] text-xs touch-manipulation flex-1 sm:flex-none ${
                        !formData.email || isSendingVerification
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSendingVerification ? 'Sending...' : 'Verify your email'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isEmailVerified || documentsLoading}
                    className={`px-4 py-2 rounded font-semibold flex items-center justify-center gap-1 transition-colors min-h-[36px] text-xs touch-manipulation flex-1 sm:flex-none ${
                      !isEmailVerified || documentsLoading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FileText size={14} className="flex-shrink-0" />
                    <span>Next: Summary</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Confirmation Modal */}
            <ConfirmationModal
              isOpen={showConfirmModal}
              title="Confirm Going Back"
              message="Are you sure you want to go back? Any unsaved changes will be lost."
              onConfirm={() => {
                setShowConfirmModal(false);
                prevStep();
              }}
              onCancel={() => setShowConfirmModal(false)}
            />

            {/* File Size Alert Modal */}
            <AlertModal
              isOpen={showFileSizeModal}
              title="File Too Large"
              message="File size must be less than 5MB. Please upload a smaller file."
              onClose={() => setShowFileSizeModal(false)}
            />
        </div>
      </div>
    </div>
  );
};

export default Step2;
