import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB] text-[#475569] text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-[#1E1B4B] text-base tracking-wider font-mono">
                CYBER<span className="text-[#6D28D9]">SHIELD</span>
              </span>
            </div>
            <p className="text-[#64748B] text-xs sm:text-sm max-w-md leading-relaxed">
              Empowering individuals and modern teams with interactive security education, actionable threat awareness, and rigorous verification quizzes to build resilient digital defenses.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#6D28D9]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> End-to-End Cryptography
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Server-Verified Audits
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#1E1B4B] text-xs font-bold uppercase tracking-wider font-mono mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/topics" className="hover:text-[#6D28D9] transition">
                  Browse Cybersecurity Topics
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#6D28D9] transition">
                  About CyberShield
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#6D28D9] transition">
                  Create Cadet Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#6D28D9] transition">
                  Sign In to Terminal
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h4 className="text-[#1E1B4B] text-xs font-bold uppercase tracking-wider font-mono mb-3">
              Frameworks
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-[#64748B]">NIST Cybersecurity Framework (CSF)</li>
              <li className="text-[#64748B]">OWASP Top 10 Security Risks</li>
              <li className="text-[#64748B]">MITRE ATT&CK Mapping</li>
              <li className="text-[#64748B]">ISO/IEC 27001 Awareness Standards</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {new Date().getFullYear()} CyberShield Awareness Platform. Engineered for digital resilience.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for cybersecurity literacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
