import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'learner'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerAuth(data);
      toast.success(`Account created! Welcome to CyberShield, ${user.name}`);
      if (user.role === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/learner/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mx-auto mb-4 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">Create Defense Profile</h2>
          <p className="text-[#64748B] text-xs sm:text-sm mt-2">
            Join the cybersecurity awareness network
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

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
                      message: 'Please enter a valid email address'
                    }
                  })}
                  placeholder="alex@domain.com"
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
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Must be at least 8 characters' },
                    validate: {
                      hasUpper: (v) => /[A-Z]/.test(v) || 'Must contain at least 1 uppercase letter',
                      hasLower: (v) => /[a-z]/.test(v) || 'Must contain at least 1 lowercase letter',
                      hasNumber: (v) => /[0-9]/.test(v) || 'Must contain at least 1 digit'
                    }
                  })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Intended Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E7EB] bg-[#FAF8FF] cursor-pointer hover:border-[#DDD6FE]">
                  <input
                    type="radio"
                    value="learner"
                    {...register('role')}
                    className="accent-[#6D28D9]"
                  />
                  <span className="text-xs font-semibold text-[#1E1B4B]">Learner (Cadet)</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E7EB] bg-[#FAF8FF] cursor-pointer hover:border-[#DDD6FE]">
                  <input
                    type="radio"
                    value="instructor"
                    {...register('role')}
                    className="accent-[#6D28D9]"
                  />
                  <span className="text-xs font-semibold text-[#1E1B4B]">Instructor</span>
                </label>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                * Note: Administrator accounts require secure internal provisioning.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6 active:scale-95"
            >
              {loading ? (
                <span>Generating credentials...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-[#6D28D9] font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
