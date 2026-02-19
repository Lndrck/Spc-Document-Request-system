import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Hero from "./components/Hero";
import Trackingrequest from "./components/Trackingrequest";
import Faq from "./components/Faq";
import ProcessingDocument from "./components/ProcessingDocument";
import AdminLogin from "./Admin/pages/AdminLogin";
import StaffLogin from "./Staff/pages/StaffLogin";
import LoginRedirect from "./components/LoginRedirect";
import { ForgotPassword, ResetPassword } from "./components";
import { AdminDashboard } from "./Admin";
import { StaffDashboard, StaffLayout } from "./Staff";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { RequestProvider } from './components/RequestContext';
import VerifyEmail from './components/VerifyEmail';
import ResponsiveNavbar from "./components/ResponsiveNavbar"; // Import ResponsiveNavbar

// Request Layout (navbar only, no footer)
const RequestLayout = ({ children }) => {
  return (
    <>
      <ResponsiveNavbar />
      <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24">
        {children}
      </div>
      {/* No Footer */}
    </>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState({
    admin: localStorage.getItem("adminToken") !== null,
    staff: localStorage.getItem("staffToken") !== null,
  });

  return (
    <Router>
      <Routes>
        {/* Public Routes with Full Layout (navbar + footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Hero />} />
          {/* <Route path="/request" element={<Form />} />*/}
          <Route path="/track" element={<Trackingrequest />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/processing-documents" element={<ProcessingDocument />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Request Route with Navbar Only (no footer) */}
        <Route path="/request/*" element={
          <RequestLayout>
            <RequestProvider />
          </RequestLayout>
        } />

        {/* Login Routes */}
        <Route path="/login/redirect" element={<LoginRedirect />} />
        <Route path="/login/admin" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login/staff" element={<StaffLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute isAuthenticated={isAuthenticated.admin} redirectTo="/login/admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Staff Routes */}
        <Route path="/staff/*" element={<ProtectedRoute isAuthenticated={isAuthenticated.staff} redirectTo="/login/staff"><StaffLayout /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
