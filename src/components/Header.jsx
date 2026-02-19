import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Search, FileText, HelpCircle, LogIn } from "lucide-react";
import spcLogo from "../assets/spclogoo.png";
import registrarLogo from "../assets/registrarlogo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Reusable component for perfectly aligned mobile links
  const MobileLink = ({ onClick, children, icon: IconComponent, to }) => {
    const baseClass = "flex items-center gap-4 text-white text-lg font-medium hover:bg-white/10 transition-all py-4 px-6 rounded-lg w-full text-left";
    
    const content = (
      <>
        {/* Fixed width container ensures text labels start at the exact same horizontal point */}
        <div className="w-6 flex justify-center flex-shrink-0">
          {IconComponent && <IconComponent size={22} className="opacity-80" />}
        </div>
        {children}
      </>
    );

    if (to) {
      return (
        <NavLink to={to} className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>
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

  const scrollToTop = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
    setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
  };


  const navigateToTrack = () => {
    navigate('/track');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#00823E] shadow-lg py-5 lg:py-8 pb-6 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <img 
                src={spcLogo} 
                alt="SPC Logo" 
                className="w-12 h-12 lg:w-16 lg:h-16 object-contain" 
              />
              <img
                src={registrarLogo}
                alt="Registrar Logo"
                className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-xs lg:text-sm font-bold leading-tight">San Pablo Colleges</h1>
              <p className="text-white text-xs lg:text-sm font-bold leading-tight">Online Document Request System</p>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Menu size={28} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <button onClick={scrollToTop} className="text-white hover:text-white/80 transition-colors">Home</button>
            <button onClick={navigateToTrack} className="text-white hover:text-white/80 transition-colors">Track Request</button>
            <NavLink to="/processing-documents" className="text-white hover:text-white/80 transition-colors">Documents</NavLink>
            <NavLink to="/faq" className="text-white hover:text-white/80 transition-colors">FAQ</NavLink>
            <Link 
              to="/login/redirect" 
              className="bg-white text-[#00823E] px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition-all"
            >
              LOGIN
            </Link>
          </nav>
        </div>
      </div>

      {/* Sidebar Overlay (Backdrop) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-in Sidebar Panel */}
      <aside className={`fixed top-0 right-0 h-full w-[300px] bg-[#00823E] z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-white font-bold text-xl">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="text-white hover:bg-white/10 p-1 rounded-full"
          >
            <X size={28} />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <MobileLink onClick={navigateToTrack} icon={Search}>Track Request</MobileLink>
          <MobileLink to="/processing-documents" icon={FileText}>Documents</MobileLink>
          <MobileLink to="/faq" icon={HelpCircle}>FAQ</MobileLink>
        </nav>

        {/* Footer Login Button - Aligned perfectly with Nav items */}
        <div className="p-6 border-t border-white/10">
          <Link
            to="/login/redirect"
            className="w-full bg-white text-[#00823E] py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LogIn size={20} /> LOGIN
          </Link>
        </div>
      </aside>
    </header>
  );
};

export default Header;