import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import { RoleBadge } from '../../components/common/Badge';
import { User, Mail, Building, Briefcase, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      title: user?.profile?.title || '',
      organization: user?.profile?.organization || '',
      bio: user?.profile?.bio || ''
    }
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateProfile({
        name: data.name,
        profile: {
          title: data.title,
          organization: data.organization,
          bio: data.bio
        }
      });
      toast.success('Defense profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          IDENTITY CREDENTIALS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Cadet Profile & Settings
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Manage your personal security profile and organization identity details.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] bg-white shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-[#EDE9FE] border-2 border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] text-3xl font-bold font-mono shadow-sm shrink-0">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-xl font-bold text-[#1E1B4B]">{user?.name}</h2>
            <RoleBadge role={user?.role} />
          </div>
          <p className="text-xs text-[#64748B] font-mono flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{user?.email}</span>
          </p>
          <p className="text-[11px] text-[#94A3B8] font-mono">
            Enrolled since {formatDate(user?.createdAt)}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-[#B91C1C] mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Professional Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. SOC Analyst / Security Engineer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
              Organization / Department
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                {...register('organization')}
                placeholder="e.g. ACME Corp Information Security"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
              Bio / Focus Area
            </label>
            <div className="relative">
              <textarea
                rows={3}
                {...register('bio')}
                placeholder="Share your cybersecurity learning goals..."
                className="w-full p-3.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
