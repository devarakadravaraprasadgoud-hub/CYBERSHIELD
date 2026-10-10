import React, { useEffect, useState } from 'react';
import { userService } from '../../services/apiServices';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  ArrowUpDown,
  Edit
} from 'lucide-react';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('learner');
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({
        page,
        limit: 10,
        search,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      });
      setUsers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser._id === currentUser?._id) {
      toast.error('You cannot change the status of your own administrator account');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await userService.update(targetUser._id, { status: nextStatus });
      toast.success(
        `Account for ${targetUser.name} is now ${nextStatus === 'active' ? 'Active' : 'Suspended'}`
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleRoleUpdate = async () => {
    if (!editingUser) return;
    try {
      await userService.update(editingUser._id, { role: newRole });
      toast.success(`Role for ${editingUser.name} changed to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, role: newRole } : u))
      );
      setEditingUser(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            USER GOVERNANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Registered Users Directory
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Audit user accounts, assign instructional permissions, and enforce access status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          >
            <option value="">All Roles</option>
            <option value="learner">Learners</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying user directory records..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match query"
          description="Try clearing search filters or modifying role criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setRoleFilter('');
            setStatusFilter('');
            setPage(1);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name / Identity</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assessments Attempted</th>
                  <th className="px-6 py-4">Enrolled Date</th>
                  <th className="px-6 py-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-[#F5F3FF]/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1E1B4B] flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EDE9FE] text-[#6D28D9] font-medium border border-[#DDD6FE]">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {u.totalAttempts || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setNewRole(u.role);
                            }}
                            disabled={isCurrent}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#6D28D9] hover:bg-[#F5F3FF] disabled:opacity-30 disabled:pointer-events-none transition"
                            title="Change Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition disabled:opacity-30 disabled:pointer-events-none ${
                              u.status === 'active'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Role Change Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Modify User Role"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating role permissions for{' '}
            <strong className="text-[#1E1B4B]">{editingUser?.name}</strong> ({editingUser?.email}).
          </p>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">
              Select Role Authorization
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#FAF8FF] hover:bg-[#F5F3FF] cursor-pointer transition">
                <input
                  type="radio"
                  name="role"
                  value="learner"
                  checked={newRole === 'learner'}
                  onChange={() => setNewRole('learner')}
                  className="accent-[#6D28D9]"
                />
                <div>
                  <strong className="text-xs text-[#1E1B4B] block">Learner</strong>
                  <span className="text-[11px] text-slate-500">
                    Standard access: Take quizzes, read modules, track achievements.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#FAF8FF] hover:bg-[#F5F3FF] cursor-pointer transition">
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={newRole === 'instructor'}
                  onChange={() => setNewRole('instructor')}
                  className="accent-[#6D28D9]"
                />
                <div>
                  <strong className="text-xs text-[#1E1B4B] block">Instructor</strong>
                  <span className="text-[11px] text-slate-500">
                    Curriculum author: Create modules, design quizzes, inspect student reports.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#FAF8FF] hover:bg-[#F5F3FF] cursor-pointer transition">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={newRole === 'admin'}
                  onChange={() => setNewRole('admin')}
                  className="accent-[#6D28D9]"
                />
                <div>
                  <strong className="text-xs text-[#1E1B4B] block">Administrator</strong>
                  <span className="text-[11px] text-slate-500">
                    Full root clearance: User directory, global topic management, platform telemetry.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRoleUpdate}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs transition shadow-sm active:scale-95"
            >
              Confirm Role Change
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
