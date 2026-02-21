import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Search, FileText, HelpCircle, LogIn } from "lucide-react";

const ResponsiveNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const scrollToTop = () => {
    navigate('/');
    closeSidebar();
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const navigateToTrackRequest = () => {
    navigate('/track');
    closeSidebar();
  };

  // Reusable component for mobile links to ensure perfect alignment
  const MobileLink = ({ onClick, children, icon, to }) => {
    // px-6 ensures consistent horizontal padding so icons align vertically
    // Use a fixed icon container and fixed text margin for pixel-perfect alignment
    const baseClass = "flex items-center text-white text-lg font-medium hover:bg-white/10 transition-all py-4 px-6 rounded-lg w-full text-left";
    const Icon = icon;

    const content = (
      <>
        <span className="w-6 flex items-center justify-center flex-shrink-0">
          {Icon && <Icon size={20} className="opacity-80" />}
        </span>
        <span className="ml-3 truncate">{children}</span>
      </>
    );

    if (to) {
      return (
        <NavLink to={to} className={baseClass} onClick={closeSidebar}>
          {content}
        </NavLink>
      );
    }

    return (
      <button onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#00823E] shadow-lg py-3 sm:py-4 lg:py-6 pb-4 sm:pb-5 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <img
                  src="/spclogoo.png"
                  alt="SPC Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
                />
                <img
                  src="/registrarlogo.png"
                  alt="Registrar Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-white text-xs sm:text-sm font-bold leading-tight">
                  <span className="block">San Pablo Colleges</span>
                  <span className="block">Online Document Request System</span>
                </h1>
              </div>
            </div>

          {/* Desktop Navigation (Hidden on Mobile) */}
            <nav className="hidden lg:flex gap-6 items-center">
              <button onClick={scrollToTop} className="text-white hover:text-white/80 transition-colors">Home</button>
              <button onClick={navigateToTrackRequest} className="text-white hover:text-white/80 transition-colors">Track Request</button>
              
              <NavLink to="/processing-documents" className="text-white hover:text-white/80 transition-colors">Documents</NavLink>
              <NavLink to="/faq" className="text-white hover:text-white/80 transition-colors">FAQ</NavLink>
              <Link
                to="/login/redirect"
                className="bg-white text-[#00823E] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-md"
              >
                LOGIN
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Slide-in Mobile Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[300px] bg-[#00823E] z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Title and Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-white font-bold text-xl">Menu</span>
          <button
            onClick={closeSidebar}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 px-0 py-6 space-y-2 overflow-y-auto">
          <MobileLink onClick={scrollToTop} icon={Home}>Home</MobileLink>
          <MobileLink onClick={navigateToTrackRequest} icon={Search}>Track Request</MobileLink>
          
          <MobileLink to="/processing-documents" icon={FileText}>Documents</MobileLink>
          <MobileLink to="/faq" icon={HelpCircle}>FAQ</MobileLink>
        </nav>

        {/* Sidebar Footer with Aligned LOGIN Button */}
        <div className="px-6 py-6 border-t border-white/10">
          <Link
            to="/login/redirect"
            className="w-full bg-white text-[#00823E] py-4 px-6 rounded-xl font-bold flex items-center justify-start shadow-lg active:scale-95 transition-transform"
            onClick={closeSidebar}
          >
              <span className="w-6 flex items-center justify-center flex-shrink-0"><LogIn size={20} /></span>
              <span className="ml-3">LOGIN</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default ResponsiveNavbar;