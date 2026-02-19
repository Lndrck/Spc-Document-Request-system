import React from "react";
import { Outlet } from "react-router-dom";
import ResponsiveNavbar from "./ResponsiveNavbar";
import Footer from "./Footer";

const PublicLayout = () => {
  return (
    <>
      <ResponsiveNavbar />
      <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default PublicLayout;