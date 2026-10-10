import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/learner/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mx-auto mb-4 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">Sign In to CyberShield</h2>
          <p className="text-[#64748B] text-xs sm:text-sm mt-2">
            Access your defense training terminal and assessments
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please provide a valid email'
                    }
                  })}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6 active:scale-95"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Fast Testing */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#64748B] font-bold block mb-2 text-center">
              Quick Demo Accounts (Local Dev)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('learner@cybershield.local', 'LearnerPass123!')}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-[#F5F3FF] hover:border-[#DDD6FE] text-[11px] font-medium text-[#6D28D9] transition text-center"
              >
                Learner
              </button>
              <button
                type="button"
                onClick={() => quickFill('instructor@cybershield.local', 'InstructorPass123!')}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-[#FAF8FF] hover:border-[#DDD6FE] text-[11px] font-medium text-[#7C3AED] transition text-center"
              >
                Instructor
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@cybershield.local', 'AdminSecurePass123!')}
                className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:border-rose-300 text-[11px] font-medium text-rose-700 transition text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#64748B] mt-6">
          Don't have a defense profile yet?{' '}
          <Link to="/register" className="text-[#6D28D9] font-bold hover:underline">
            Register as Cadet
          </Link>
        </p>
      </div>
    </div>
  );
};
