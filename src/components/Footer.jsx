import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Building2,
  ExternalLink
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#00823E] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Institution Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-[#00823E]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">San Pablo Colleges</h3>
                  <p className="text-green-200 text-sm font-medium">Registrar Services</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed mb-6 max-w-md">
                Official document request portal for San Pablo Colleges students, alumni, and authorized institutions.
                Fast, secure, and reliable academic document services.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://sanpablocolleges.edu.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <Globe className="w-4 h-4 text-white group-hover:text-green-200 transition-colors" />
                  <span className="text-sm font-medium text-white group-hover:text-green-200 transition-colors">Visit Website</span>
                  <ExternalLink className="w-3 h-3 text-white group-hover:translate-x-1 group-hover:text-green-200 transition-all" />
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 group">
                  <MapPin className="w-5 h-5 text-green-200 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                  <div className="text-white/90 text-sm leading-relaxed group-hover:text-white transition-colors">
                    Hermanos Belen St., Barangay 3A<br />
                    San Pablo City, Laguna, 4000<br />
                    Philippines
                  </div>
                </div>
                <div className="flex items-center space-x-3 group">
                  <Phone className="w-5 h-5 text-green-200 flex-shrink-0 group-hover:text-white transition-colors" />
                  <span className="text-white/90 text-sm group-hover:text-white transition-colors">+63 (049) 562-6006</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <Mail className="w-5 h-5 text-green-200 flex-shrink-0 group-hover:text-white transition-colors" />
                  <span className="text-white/90 text-sm group-hover:text-white transition-colors">registrar@sanpablocolleges.edu.ph</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/request"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 text-sm block focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10"
                  >
                    Request Documents
                  </Link>
                </li>
                <li>
                  <Link
                    to="/track"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 text-sm block focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10"
                  >
                    Track Request
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 text-sm block focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10"
                  >
                    FAQ & Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-white/80 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} San Pablo Colleges. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-white/80">
                <span>Document Request Portal v1.0</span>
                <span className="hidden md:block text-white/60">•</span>
                <span>Secure & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;