import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { RoleBadge } from './Badge';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInstructor) return '/instructor/dashboard';
    return '/learner/dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Learning Topics', path: '/topics' },
    { label: 'About', path: '/about' }
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] group-hover:border-[#C4B5FD] group-hover:shadow-[0_0_15px_rgba(109,40,217,0.2)] transition-all">
              <Shield className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-[#1E1B4B] flex items-center gap-1 font-mono">
                CYBER<span className="text-[#6D28D9]">SHIELD</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-medium tracking-widest uppercase">
                Awareness Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#6D28D9] bg-[#EDE9FE] font-semibold'
                      : 'text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DDD6FE] bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE]/70 text-xs font-semibold tracking-wide transition shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-6 w-[1px] bg-[#E5E7EB]" />

                <Link
                  to="/learner/profile"
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F5F3FF] transition group"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#1E1B4B] group-hover:text-[#6D28D9] transition">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <RoleBadge role={user?.role} />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-sm transition shadow-md shadow-purple-500/20 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-[#475569] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#6D28D9] font-semibold bg-[#EDE9FE] border border-[#DDD6FE]"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
              <Link
                to="/learner/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#475569] hover:bg-[#F5F3FF]"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#B91C1C] hover:bg-[#FEF2F2]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-[#E5E7EB] text-[#475569] hover:text-[#1E1B4B] font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
