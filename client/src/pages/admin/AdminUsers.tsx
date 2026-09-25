import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { User, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  UserX,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Crown,
  UserCog,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const toast = useToast();

  // Suspension modal state
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Role change modal state (SuperAdmin only)
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<'USER' | 'ADMIN'>('ADMIN');
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);

  const debouncedSearch = useDebounce(searchTerm, 400);


  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 15,
        search: debouncedSearch.trim() || undefined,
        role: roleFilter || undefined,
      });

      if (res.success) {
        setUsers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = async () => {
    if (!targetUser) return;
    setIsProcessing(true);
    try {
      const nextState = !targetUser.isSuspended;
      await adminService.toggleUserSuspension(targetUser._id, {
        isSuspended: nextState,
        suspensionReason: nextState ? suspensionReason.trim() : undefined,
      });

      toast.success(
        nextState
          ? `Account '${targetUser.name}' has been suspended`
          : `Account '${targetUser.name}' has been restored`
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, isSuspended: nextState, suspensionReason: nextState ? suspensionReason : '' }
            : u
        )
      );
      setTargetUser(null);
      setSuspensionReason('');
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChangeSubmit = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await adminService.updateUserRole(roleModalUser._id, selectedNewRole);
      toast.success(res.message || 'User role updated successfully');

      setUsers((prev) =>
        prev.map((u) => (u._id === roleModalUser._id ? { ...u, role: selectedNewRole } : u))
      );
      setRoleModalUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-dark-950">
              Users & Roles Management
            </h1>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300">
                <Crown className="w-3 h-3 text-gold-600" />
                Super Control Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-body text-muted mt-1">
            Registered devotees list, verification status, administrator role assignments, and account controls.
          </p>
        </div>
      </div>

      {/* Search and Role Filter Bar */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-soft flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        {/* Role Filter tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Users (USER)', value: 'USER' },
            { label: 'Admins (ADMIN)', value: 'ADMIN' },
            { label: 'Super Admin', value: 'SUPERADMIN' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setRoleFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                roleFilter === tab.value
                  ? 'bg-maroon-700 text-cream-50 font-bold shadow-sm'
                  : 'bg-cream-200 text-dark-800 hover:bg-cream-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
          <p className="text-xs font-body text-muted">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-body text-muted">No users found</p>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-semibold text-muted uppercase font-body tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80 text-xs font-body">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  const isSuper = u.role === 'SUPERADMIN';
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u._id} className="hover:bg-cream-50 transition-colors">
                      <td className="p-4 font-semibold text-dark-950">
                        <div className="flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-gold-200 text-gold-900 px-1.5 py-0.5 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted">{u.email}</td>
                      <td className="p-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 text-dark-950 shadow-xs">
                            <Crown className="w-3.5 h-3.5 text-dark-950" />
                            SUPERADMIN
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-maroon-100 text-maroon-800 border border-maroon-300">
                            <ShieldAlert className="w-3.5 h-3.5 text-maroon-700" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-cream-200 text-dark-800 border border-cream-300">
                            USER
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isEmailVerified ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-muted whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="p-4">
                        {u.isSuspended ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Super Admin Role Assignment Button */}
                          {isSuperAdmin && !isSuper && !isSelf && (
                            <button
                              onClick={() => {
                                setRoleModalUser(u);
                                setSelectedNewRole(u.role === 'ADMIN' ? 'USER' : 'ADMIN');
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-gold-50 text-gold-900 border-gold-400 hover:bg-gold-100'
                              }`}
                              title={
                                u.role === 'ADMIN'
                                  ? 'Demote to regular user'
                                  : 'Promote to Admin'
                              }
                            >
                              <UserCog className="w-3.5 h-3.5 text-gold-700" />
                              <span>
                                {u.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                              </span>
                            </button>
                          )}

                          {/* Suspension Button */}
                          {!isSuper && !isSelf && (
                            <button
                              onClick={() => setTargetUser(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                u.isSuspended
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {u.isSuspended ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Suspend</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-cream-300 flex items-center justify-between">
              <span className="text-xs text-muted">
                Total {pagination.total} users (Page {pagination.page} of {pagination.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Assignment Modal (SuperAdmin Only) */}
      {roleModalUser && (
        <Modal
          isOpen={!!roleModalUser}
          onClose={() => setRoleModalUser(null)}
          title="Change User Role"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-body text-dark-800">
              You are changing the role for <strong>{roleModalUser.name}</strong> ({roleModalUser.email}):
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-dark-900 font-body">
                Select New Role:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedNewRole('USER')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    selectedNewRole === 'USER'
                      ? 'bg-cream-100 border-gold-600 ring-2 ring-gold-500'
                      : 'bg-cream-50 border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <span className="text-xs font-bold font-body text-dark-950">
                    👤 Regular User (USER)
                  </span>
                  <span className="text-[11px] text-muted font-body">
                    Can view and share sacred memories.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNewRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    selectedNewRole === 'ADMIN'
                      ? 'bg-maroon-50 border-maroon-600 ring-2 ring-maroon-600'
                      : 'bg-cream-50 border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <span className="text-xs font-bold font-body text-maroon-900">
                    🛡️ Administrator (ADMIN)
                  </span>
                  <span className="text-[11px] text-muted font-body">
                    Can moderate memories, reports, and committee.
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleModalUser(null)}
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleRoleChangeSubmit}
                isLoading={isUpdatingRole}
              >
                Apply Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Suspension Modal */}
      {targetUser && (
        <Modal
          isOpen={!!targetUser}
          onClose={() => setTargetUser(null)}
          title={targetUser.isSuspended ? 'Restore Account' : 'Suspend Account'}
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-body text-dark-800">
              Are you sure you want to {targetUser.isSuspended ? 'restore' : 'suspend'} the account of{' '}
              <strong>{targetUser.name}</strong> ({targetUser.email})?
            </p>

            {!targetUser.isSuspended && (
              <div>
                <label className="block text-xs font-semibold text-dark-900 font-body mb-1">
                  Suspension Reason:
                </label>
                <textarea
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g., Inappropriate content or objectionable activity..."
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetUser(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={targetUser.isSuspended ? 'gold' : 'danger'}
                size="sm"
                onClick={handleToggleSuspend}
                isLoading={isProcessing}
              >
                {targetUser.isSuspended ? 'Restore Account' : 'Suspend Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
