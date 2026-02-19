import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { RequestContext, API_BASE_URL, api } from '../context/RequestContext';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

export const RequestProvider = ({ children }) => { // eslint-disable-line no-unused-vars
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = useMemo(() => location.state?.preselected || [], [location.state]);

  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    requesterType: "Student",
    studentNumber: "",
    email: "",
    surname: "",
    firstName: "",
    middleInitial: "",
    suffix: "",
    contactNo: "",
    course: "",
    year: "",
    educationalLevel: "",
    collegeDepartment: "",
    graduationYear: "",
    purposeOfRequest: "",
    otherPurpose: "",
    alumniVerificationFile: null,
    documents: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [requestInfo, setRequestInfo] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [requestPurposes, setRequestPurposes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tempReferenceNumber, setTempReferenceNumber] = useState('');
  const [purposesLoading, setPurposesLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(() => {
    // Check localStorage on initialization
    return localStorage.getItem('emailVerified') === 'true';
  });
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [lastVerificationSent, setLastVerificationSent] = useState(0);

  // Resend cooldown (30 seconds)
  const RESEND_COOLDOWN = 30 * 1000;

  // Expose refresh function globally for admin panel
  useEffect(() => {
    window.refreshDocumentForm = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    return () => {
      delete window.refreshDocumentForm;
    };
  }, []);

  // Fetch documents and purposes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const response = await api.get('/documents');
        if (response.data && response.data.data) {
          setFormData(prev => ({
            ...prev,
            documents: response.data.data.map(doc => ({
              id: doc.id,
              name: doc.name,
              price: parseFloat(doc.price),
              checked: false,
              quantity: 0,
              year: "",
              semester: "",
              sem_options: ["summer", "1st sem", "2nd sem"]
            }))
          }));
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setFormData(prev => ({
          ...prev,
          documents: [
            { id: 1, name: "Registration Form", price: 80, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
            { id: 2, name: "Certificate of Grades", price: 75, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
            { id: 3, name: "Certificate of Enrollment", price: 50, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
            { id: 4, name: "Transcript of Records", price: 70, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
            { id: 5, name: "Good Moral Certificate", price: 50, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
            { id: 6, name: "Clearance Form", price: 50, checked: false, quantity: 0, year: "", semester: "", sem_options: ["summer", "1st sem", "2nd sem"] },
          ]
        }));
      } finally {
        setDocumentsLoading(false);
      }
    };

    const fetchPurposes = async () => {
        try {
          const response = await api.get('/purposes');
          if (response.data && response.data.data) {
            setRequestPurposes(response.data.data);
          } else {
            setRequestPurposes(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching purposes:', error);
          setRequestPurposes([
            { id: 1, name: "Employment" },
            { id: 2, name: "Scholarship Application" },
            { id: 3, name: "School Transfer" },
            { id: 4, name: "Further Studies" },
            { id: 5, name: "Board Examination" },
            { id: 6, name: "Personal Reference" },
            { id: 7, name: "Other" }
          ]);
        } finally {
          setPurposesLoading(false);
        }
      };

     const fetchDepartments = async () => {
       try {
         setDepartmentsLoading(true);
         const response = await api.get('/departments');
         if (response.data && response.data.data) {
           // Normalize the data to ensure consistent property names
           const normalizedDepartments = response.data.data.map(dept => ({
             id: dept.department_id || dept.id,
             name: dept.department_name || dept.name
           }));
           setDepartments(normalizedDepartments);
         } else {
           setDepartments([]);
         }
       } catch (error) {
         console.error('Error fetching departments:', error);
         setDepartments([
           { id: 1, name: "College of Computer Studies" },
           { id: 2, name: "College of Business Administration" },
           { id: 3, name: "College of Arts & Sciences" },
           { id: 4, name: "Basic Education Department" },
           { id: 5, name: "Grade School Department" },
           { id: 6, name: "Junior High School Department" },
           { id: 7, name: "Senior High School Department" },
           { id: 9, name: "College of Education" },
           { id: 11, name: "College of Nursing" },
           { id: 13, name: "College of Accountancy" },
           { id: 15, name: "College of Physical Therapy" },
           { id: 16, name: "College of Radiologic Technology" },
           { id: 14, name: "College of Law" },
           { id: 18, name: "Graduate School" },
           { id: 19, name: "Postgraduate Degree" }
         ]);
       } finally {
         setDepartmentsLoading(false);
       }
      };

     const fetchCourses = async () => {
       try {
         setCoursesLoading(true);
         const response = await api.get('/courses');
         if (response.data && response.data.data) {
           setCourses(response.data.data);
         } else {
           setCourses([]);
         }
       } catch (error) {
         console.error('Error fetching courses:', error);
         setCourses([]);
       } finally {
         setCoursesLoading(false);
       }
      };

    // Listen for document updates from admin panel
    const handleDocumentsUpdated = () => {
      fetchDocuments();
    };

    window.addEventListener('documentsUpdated', handleDocumentsUpdated);

    fetchDocuments();
    fetchPurposes();
    fetchDepartments();
    fetchCourses();

    return () => {
      window.removeEventListener('documentsUpdated', handleDocumentsUpdated);
    };
  }, [refreshTrigger]);

  // Preselect documents
  useEffect(() => {
    if (!preselected.length) return;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.documents = prev.documents.map((doc) => {
        if (preselected.includes(doc.name)) {
          return { ...doc, checked: true, quantity: doc.quantity > 0 ? doc.quantity : 1 };
        }
        return doc;
      });
      return updated;
    });
  }, [preselected, formData.documents.length]);

  // Update currentStep based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/request/step1') setCurrentStep(1);
    else if (path === '/request/step2') {
      setCurrentStep(2);
      // Generate temporary reference number when entering Step2
      // Format: SPC-DOC-XXXXXX-XXXX (6-digit sequence + 4-digit sequence)
      if (!tempReferenceNumber) {
        const timestamp = Date.now().toString();
        // Ensure 6-digit sequence (pad with zeros if needed)
        const sequence6 = timestamp.slice(-6).padStart(6, '0');
        // Ensure 4-digit sequence (pad with zeros if needed)
        const sequence4 = timestamp.slice(-4).padStart(4, '0');
        const tempRef = `SPC-DOC-${sequence6}-${sequence4}`;
        console.log('Generated temp reference:', tempRef);
        setTempReferenceNumber(tempRef);
      }
      // Check email verification status when entering Step2
      if (formData.email?.trim()) {
        setTimeout(() => checkEmailVerification(formData.email), 200);
      }
    }
    else if (path === '/request/step3') setCurrentStep(3);
  }, [location.pathname, tempReferenceNumber, formData.email]);

  // Helper function to check if course should be disabled based on year
  const isCourseDisabled = (year) => {
    const disabledYears = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
    return disabledYears.includes(year);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    if (name === 'requesterType') {
      // When switching requester type, clear relevant fields
      if (value === 'Alumni') {
        updatedData.studentNumber = '';
        updatedData.year = '';
        updatedData.educationalLevel = '';
        updatedData.alumniVerificationFile = null;
      } else {
        // Switching to Student
        updatedData.graduationYear = '';
        updatedData.alumniVerificationFile = null;
      }
      // Clear email when switching types
      updatedData.email = '';
      // Reset email verification
      resetEmailVerification();
      // Clear course and college department as they depend on requester type
      updatedData.course = '';
      updatedData.collegeDepartment = '';
    } else if (name === 'email') {
      // Reset email verification when email changes
      resetEmailVerification();
      // Check verification status for the new email
      setTimeout(() => checkEmailVerification(value), 100);
    } else if (name === 'year') {
      updatedData.educationalLevel = getEducationalLevelFromYear(value);
      // Clear course and department when year level changes
      updatedData.course = '';
      updatedData.collegeDepartment = '';
      // Clear course if year level doesn't require it
      if (isCourseDisabled(value)) {
        updatedData.course = '';
      }
    } else if (name === 'educationalLevel') {
      // Clear course if educational level doesn't require it
      if (value === 'elementary' || value === 'juniorHigh') {
        updatedData.course = '';
      }
    } else if (name === 'course') {
      // Auto-populate department for alumni when course is selected
      if (formData.requesterType === 'Alumni' && value) {
        const selectedCourse = courses.find(c => c.courseName === value);
        if (selectedCourse && selectedCourse.department_id) {
          updatedData.collegeDepartment = selectedCourse.department_id;
        }
      }
    }
    setFormData(updatedData);
  };

  const getEducationalLevelFromYear = (yearLevel) => {
    if (!yearLevel) return '';
    if (['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(yearLevel)) {
      return 'elementary';
    } else if (['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(yearLevel)) {
      return 'juniorHigh';
    } else if (['Grade 11', 'Grade 12'].includes(yearLevel)) {
      return 'seniorHigh';
    } else if (['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(yearLevel)) {
      return 'undergraduate';
    } else if (yearLevel === 'Master\'s Degrees') {
      return 'graduate';
    } else if (yearLevel === 'Doctoral Degrees') {
      return 'graduate';
    } else if (yearLevel === 'Postgraduate Level') {
      return 'postgraduate';
    } else {
      return 'graduate';
    }
  };

  const handleDocCheck = (index, checked) => {
    const docs = [...formData.documents];
    docs[index].checked = checked;
    if (!checked) {
      docs[index].quantity = 0;
      docs[index].year = "";
      docs[index].semester = "";
    }
    setFormData({ ...formData, documents: docs });
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 0) return;
    const docs = [...formData.documents];
    docs[index].quantity = newQuantity;
    setFormData({ ...formData, documents: docs });
  };

  const handleDocumentChange = (index, field, value) => {
    const docs = [...formData.documents];
    docs[index][field] = value;
    setFormData({ ...formData, documents: docs });
  };

  const handleAlumniFileChange = (file) => {
    setFormData({ ...formData, alumniVerificationFile: file });
  };

  // Email verification functions
  const sendVerificationEmail = async () => {
    if (!formData.email?.trim()) {
      setEmailVerificationError('Please enter an email address first');
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastVerificationSent < RESEND_COOLDOWN) {
      const remaining = Math.ceil((RESEND_COOLDOWN - (now - lastVerificationSent)) / 1000);
      setEmailVerificationError(`Please wait ${remaining} seconds before requesting another code.`);
      return;
    }

    setIsSendingVerification(true);
    setEmailVerificationError('');
    setOtpCode(''); // Clear any previous OTP

    try {
      const response = await api.post('/send-verification-code', {
        email: formData.email.trim()
      });

      if (response.data.success) {
        setLastVerificationSent(now); // Update last sent timestamp
        setShowOTPInput(true); // Show OTP input field
        alert('Verification code sent! Please check your email and enter the code below.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setEmailVerificationError(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode?.trim()) {
      setEmailVerificationError('Please enter the verification code');
      return;
    }

    setIsVerifyingOTP(true);
    setEmailVerificationError('');

    try {
      const response = await api.post('/verify-email-code', {
        email: formData.email.trim(),
        code: otpCode.trim()
      });

      if (response.data.success) {
        setIsEmailVerified(true);
        localStorage.setItem('emailVerified', 'true');
        setShowOTPInput(false);
        setOtpCode('');
        alert('Email verified successfully!');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setEmailVerificationError(error.response?.data?.message || 'Failed to verify code');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const checkEmailVerification = async (email) => {
    if (!email?.trim()) {
      setIsEmailVerified(false);
      return;
    }

    try {
      const response = await api.get(`/check-verification?email=${encodeURIComponent(email.trim())}`);
      setIsEmailVerified(response.data.verified || false);
    } catch (error) {
      console.error('Error checking email verification:', error);
      setIsEmailVerified(false);
    }
  };

  const resetEmailVerification = () => {
    setIsEmailVerified(false);
    setEmailVerificationError('');
    setShowOTPInput(false);
    setOtpCode('');
    setIsVerifyingOTP(false);
    setLastVerificationSent(0);
    localStorage.removeItem('emailVerified');
  };

  // Check if resend is allowed (cooldown check)
  const canResend = () => {
    const now = Date.now();
    return now - lastVerificationSent >= RESEND_COOLDOWN;
  };


  const getAdjustedDocuments = () => {
    return formData.documents.map((doc) => {
      let adjustedDoc = { ...doc };
      
      if (doc.name === "Transcript of Records") {
        let adjustedPrice = 70;
        if (formData.educationalLevel === "undergraduate") adjustedPrice = 60;
        if (formData.educationalLevel === "graduate") adjustedPrice = 122;
        adjustedDoc.price = adjustedPrice;
      } else {
        // Ensure all documents have a price field for server validation
        if (!adjustedDoc.price || adjustedDoc.price <= 0) {
          // Default price for documents that don't have one
          adjustedDoc.price = adjustedDoc.basePrice || adjustedDoc.price || 0;
        }
      }
      
      // Ensure price is a number
      adjustedDoc.price = Number(adjustedDoc.price) || 0;
      
      return adjustedDoc;
    });
  };

  const calculateTotal = () => {
    return getAdjustedDocuments()
      .filter(doc => doc.checked && doc.quantity > 0)
      .reduce((total, doc) => total + (doc.price * doc.quantity), 0);
  };

  const validateForm = () => {
    const errors = {};

    // Basic field validations
    if (formData.requesterType === 'Student' && !formData.studentNumber?.trim()) errors.studentNumber = 'Student number is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    if (!formData.surname?.trim()) errors.surname = 'Surname is required';
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.middleInitial?.trim()) errors.middleInitial = 'Middle Initial is required';
    // Suffix is optional - not all people have a suffix
    if (!formData.contactNo?.trim()) errors.contactNo = 'Contact number is required';

    // Course validation: only required for students who should have courses (not early education)
    if (formData.requesterType === 'Student' && !isCourseDisabled(formData.year) && !formData.course?.trim()) {
        errors.course = 'Course is required';
    }

    // Year level validation: only for students
    if (formData.requesterType === 'Student' && !formData.year?.trim()) errors.year = 'Year level is required';
    if (formData.requesterType === 'Student' && !formData.educationalLevel?.trim()) errors.educationalLevel = 'Educational level is required';
    if (formData.requesterType === 'Student') {
      const department = String(formData.collegeDepartment || '').trim();
      if (!department) errors.collegeDepartment = 'College Department is required';
    }

    // Alumni validations
    if (formData.requesterType === 'Alumni' && !formData.course?.trim()) errors.course = 'Course is required';
    // graduationYear is no longer required for alumni - schoolYear/semester are captured from document cards
    if (formData.requesterType === 'Alumni') {
      const department = String(formData.collegeDepartment || '').trim();
      if (!department) errors.collegeDepartment = 'College Department is required';
    }

    if (!formData.purposeOfRequest?.trim()) errors.purposeOfRequest = 'Purpose is required';

    // Note: schoolYear and requestSemester are now obtained from the first selected document's year and semester


    // Email format validation (more permissive)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email format (e.g., user@domain.com)';
    }

    // Document selection validation
    if (!formData.documents || formData.documents.length === 0) {
      errors.documents = 'Documents are still loading. Please wait.';
    } else {
      const hasSelectedDoc = formData.documents.some(doc => doc.checked && doc.quantity > 0);
      if (!hasSelectedDoc) {
        errors.documents = 'Please select at least one document and set quantity greater than 0';
      }

      // Validate selected documents have required fields
      if (hasSelectedDoc) {
        formData.documents.forEach((doc, index) => {
          if (doc.checked && doc.quantity > 0) {
            // For documents that need year/semester, validate they have values
            // Exclude documents that don't typically need year/semester
            const requiresYearSemester = !["Registration Form", "Good Moral Certificate", "Clearance Form"].includes(doc.name);
            if (requiresYearSemester) {
              if (!doc.year?.trim()) {
                errors[`document_${index}_year`] = `${doc.name} requires year`;
              }
              if (!doc.semester?.trim()) {
                errors[`document_${index}_semester`] = `${doc.name} requires semester`;
              }
            }
          }
        });
      }
    }

    return errors;
  };

  // Navigation handlers
  const nextStep = () => {
    if (currentStep === 1) {
      if (!agreedToPrivacy) {
        alert('Please agree to the privacy notice to proceed.');
        return;
      }
      navigate('/request/step2');
    } else if (currentStep === 2) {
      // Check email verification first
      if (!isEmailVerified) {
        alert('Please verify your email address before proceeding to the next step.');
        return;
      }

      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const firstError = Object.values(errors)[0];
        setSubmitError(firstError || 'Please fix the errors before proceeding.');
        return;
      }
      setFieldErrors({});
      setSubmitError('');
      navigate('/request/step3');
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      navigate('/request/step1');
    } else if (currentStep === 3) {
      navigate('/request/step2');
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    // Handle both direct calls and form submissions
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // Clear previous errors
    setSubmitError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {

      // Handle purpose field: if "Other, please specify" is selected, use the custom text
      const finalPurposeOfRequest = formData.purposeOfRequest === "Other, please specify" && formData.otherPurpose?.trim()
        ? formData.otherPurpose.trim()
        : formData.purposeOfRequest;

      // For K-10 students, the course value is the grade level (e.g., "Grade 1")
      // which will be looked up/created by the backend's getOrCreateCourse method
      let courseValue = formData.course;
      // No longer setting courseValue to null - let backend handle K-10 course lookup

      // Set studentNumber to null for alumni
      let studentNumberValue = formData.studentNumber;
      if (formData.requesterType === 'Alumni') {
        studentNumberValue = null;
      }

      const submitData = {
        requesterType: formData.requesterType,
        studentNumber: studentNumberValue,
        spcEmail: formData.email,
        surname: formData.surname,
        firstName: formData.firstName,
        middleInitial: formData.middleInitial === '' ? null : formData.middleInitial,
        suffix: formData.suffix === '' ? null : formData.suffix,
        contactNo: formData.contactNo,
        course: courseValue,
        year: formData.year,
        educationalLevel: formData.educationalLevel === '' ? null : formData.educationalLevel,
        collegeDepartment: formData.collegeDepartment === '' ? null : formData.collegeDepartment,
        // graduationYear is no longer sent - schoolYear/semester are captured from document cards
        purposeOfRequest: finalPurposeOfRequest,
        otherPurpose: formData.otherPurpose === '' ? null : formData.otherPurpose,
        tempReferenceNumber: tempReferenceNumber, // Include the temporary reference number
        // Get schoolYear and requestSemester from the first selected document
        schoolYear: (() => {
          const selectedDocs = getAdjustedDocuments().filter(doc => doc.checked && doc.quantity > 0);
          return selectedDocs.length > 0 ? (selectedDocs[0].year || null) : null;
        })(),
        requestSemester: (() => {
          const selectedDocs = getAdjustedDocuments().filter(doc => doc.checked && doc.quantity > 0);
          return selectedDocs.length > 0 ? (selectedDocs[0].semester || null) : null;
        })(),
        documents: getAdjustedDocuments().map(doc => ({
          ...doc,
          year: doc.year === '' ? null : doc.year,
          semester: doc.semester === '' ? null : doc.semester
        }))
      };

      // Debug logging
      console.log('=== CLIENT SUBMISSION DEBUGGING ===');
      console.log('Submit data being sent to server:', JSON.stringify(submitData, null, 2));
      console.log('Raw form data:', JSON.stringify(formData, null, 2));
      console.log('Documents after adjustment:', JSON.stringify(getAdjustedDocuments(), null, 2));
      console.log('=== END CLIENT DEBUGGING ===');

      const endpoint = formData.requesterType === 'Student' ? '/students' : '/alumni';

      let response;
      if (formData.requesterType === 'Alumni') {
        // For alumni, send FormData with file
        const formDataToSend = new FormData();

        // Add all form data
        Object.keys(submitData).forEach(key => {
          if (key === 'documents') {
            formDataToSend.append(key, JSON.stringify(submitData[key]));
          } else {
            formDataToSend.append(key, submitData[key] || '');
          }
        });

        // Add the alumni verification file
        if (formData.alumniVerificationFile) {
          formDataToSend.append('alumniVerificationFile', formData.alumniVerificationFile);
        }

        response = await api.post(endpoint, formDataToSend, {
          timeout: 15000,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // For students, send JSON as before
        response = await api.post(endpoint, submitData, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!response.data || !response.data.request) {
        throw new Error('Invalid response from server');
      }

      const requestInfoData = {
        requestId: response.data.request.requestId,
        requestNo: response.data.request.requestNo,
        referenceNumber: response.data.request.referenceNumber,
        message: response.data.message
      };

      setReferenceNumber(response.data.request.referenceNumber);
      setRequestInfo(requestInfoData);
      setSubmitted(true);

      // Force a state update to ensure UI reflects changes
      setTimeout(() => {
        console.log('Submission completed, state updated:', {
          submitted: true,
          referenceNumber: response.data.request.referenceNumber,
          requestInfo: requestInfoData,
          currentStep: 3
        });
      }, 100);
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Full error object:', error);
      console.error('Response data:', error.response?.data);

      if (error.response?.data?.errors) {
        console.log('Backend validation errors:', error.response.data.errors);
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.param && err.msg) {
            backendErrors[err.param] = err.msg;
            console.log(`Field error: ${err.param} -> ${err.msg}`);
          }
        });
        setFieldErrors(backendErrors);

        // Show first field error in submitError for visibility
        const firstError = Object.values(backendErrors)[0];
        if (firstError) {
          setSubmitError(firstError);
        } else {
          setSubmitError(error.response?.data?.message || 'Validation failed - please check your input');
        }
      } else {
        setSubmitError(error.response?.data?.message || error.message || 'Submission failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    currentStep,
    setCurrentStep,
    agreedToPrivacy,
    setAgreedToPrivacy,
    formData,
    setFormData,
    submitted,
    setSubmitted,
    requestInfo,
    setRequestInfo,
    submitError,
    setSubmitError,
    fieldErrors,
    setFieldErrors,
    isSubmitting,
    documentsLoading,
    referenceNumber,
    tempReferenceNumber,
    requestPurposes,
    purposesLoading,
    departments,
    departmentsLoading,
    courses,
    coursesLoading,
    // Email verification
    isEmailVerified,
    setIsEmailVerified,
    isSendingVerification,
    emailVerificationError,
    sendVerificationEmail,
    checkEmailVerification,
    resetEmailVerification,
    showOTPInput,
    otpCode,
    setOtpCode,
    verifyOTP,
    isVerifyingOTP,
    canResend,
    handleInputChange,
    handleDocCheck,
    handleQuantityChange,
    handleDocumentChange,
    handleAlumniFileChange,
    getAdjustedDocuments,
    calculateTotal,
    validateForm,
    nextStep,
    prevStep,
    handleSubmit
  };

  return (
    <RequestContext.Provider value={value}>
      <Routes>
        <Route index element={<Step1 />} />
        <Route path="step1" element={<Step1 />} />
        <Route path="step2" element={<Step2 />} />
        <Route path="step3" element={<Step3 />} />
      </Routes>
    </RequestContext.Provider>
  );
};
