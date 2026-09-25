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
      toast.error(err.message || 'उपयोगकर्ता लोड करने में त्रुटि');
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
          ? `खाता '${targetUser.name}' निलंबित कर दिया गया`
          : `खाता '${targetUser.name}' बहाल कर दिया गया`
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
      toast.error(err.message || 'कार्यवाही विफल हुई');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChangeSubmit = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await adminService.updateUserRole(roleModalUser._id, selectedNewRole);
      toast.success(res.message || 'उपयोगकर्ता भूमिका सफलतापूर्वक अपडेट की गई');

      setUsers((prev) =>
        prev.map((u) => (u._id === roleModalUser._id ? { ...u, role: selectedNewRole } : u))
      );
      setRoleModalUser(null);
    } catch (err: any) {
      toast.error(err.message || 'भूमिका परिवर्तन विफल हुआ');
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
            <h1 className="text-2xl font-devanagari-heading font-bold text-dark-950">
              उपयोगकर्ता एवं भूमिका प्रबंधन (Users & Roles)
            </h1>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300">
                <Crown className="w-3 h-3 text-gold-600" />
                सुपर कंट्रोल सक्रिय
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            पंजीकृत भक्तों की सूची, सत्यापन स्थिति, व्यवस्थापक भूमिका आवंटन एवं खाता नियंत्रण।
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
            placeholder="नाम या ईमेल द्वारा खोजें..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-devanagari-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        {/* Role Filter tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'सभी', value: '' },
            { label: 'भक्त (USER)', value: 'USER' },
            { label: 'व्यवस्थापक (ADMIN)', value: 'ADMIN' },
            { label: 'सुपर व्यवस्थापक', value: 'SUPERADMIN' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setRoleFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-devanagari-body font-medium transition-all ${
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
          <p className="text-xs font-devanagari-body text-muted">उपयोगकर्ता लोड हो रहे हैं...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-devanagari-body text-muted">कोई उपयोगकर्ता नहीं मिला</p>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-semibold text-muted uppercase font-devanagari-body tracking-wider">
                  <th className="p-4">नाम</th>
                  <th className="p-4">ईमेल</th>
                  <th className="p-4">भूमिका (Role)</th>
                  <th className="p-4">सत्यापन</th>
                  <th className="p-4">पंजीकरण तिथि</th>
                  <th className="p-4">खाता स्थिति</th>
                  <th className="p-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80 text-xs font-devanagari-body">
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
                              आप
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
                            USER (भक्त)
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isEmailVerified ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            सत्यापित
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">अपुष्ट</span>
                        )}
                      </td>
                      <td className="p-4 text-muted whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="p-4">
                        {u.isSuspended ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            निलंबित (Suspended)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            सक्रिय (Active)
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
                                  ? 'भूमिका बदलकर सामान्य भक्त बनाएं'
                                  : 'इस उपयोगकर्ता को व्यवस्थापक (Admin) बनाएं'
                              }
                            >
                              <UserCog className="w-3.5 h-3.5 text-gold-700" />
                              <span>
                                {u.role === 'ADMIN' ? 'भक्त बनाएं' : 'व्यवस्थापक बनाएं'}
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
                                  <span>बहाल करें</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>निलंबित</span>
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
                कुल {pagination.total} उपयोगकर्ता (पृष्ठ {pagination.page} / {pagination.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  पिछला
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  अगला
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
          title="उपयोगकर्ता भूमिका परिवर्तन (Change User Role)"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-devanagari-body text-dark-800">
              आप <strong>{roleModalUser.name}</strong> ({roleModalUser.email}) की भूमिका बदलना चाहते हैं:
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-dark-900 font-devanagari-body">
                नई भूमिका चुनें:
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
                  <span className="text-xs font-bold font-devanagari-body text-dark-950">
                    👤 सामान्य भक्त (USER)
                  </span>
                  <span className="text-[11px] text-muted font-devanagari-body">
                    केवल यादें देख व साझा कर सकते हैं।
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
                  <span className="text-xs font-bold font-devanagari-body text-maroon-900">
                    🛡️ व्यवस्थापक (ADMIN)
                  </span>
                  <span className="text-[11px] text-muted font-devanagari-body">
                    स्मृतियाँ, रिपोर्ट्स व समिति मॉडरेट कर सकते हैं।
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
                रद्द करें
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleRoleChangeSubmit}
                isLoading={isUpdatingRole}
              >
                भूमिका लागू करें
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
          title={targetUser.isSuspended ? 'खाता बहाल करें' : 'खाता निलंबित करें'}
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-devanagari-body text-dark-800">
              क्या आप वास्तव में <strong>{targetUser.name}</strong> ({targetUser.email}) के खाते को{' '}
              {targetUser.isSuspended ? 'बहाल' : 'निलंबित'} करना चाहते हैं?
            </p>

            {!targetUser.isSuspended && (
              <div>
                <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1">
                  निलंबन का कारण (Reason):
                </label>
                <textarea
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="उदा. अनुचित सामग्री या आपत्तिजनक गतिविधि..."
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50 text-xs font-devanagari-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
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
                रद्द करें
              </Button>
              <Button
                variant={targetUser.isSuspended ? 'gold' : 'danger'}
                size="sm"
                onClick={handleToggleSuspend}
                isLoading={isProcessing}
              >
                {targetUser.isSuspended ? 'खाता बहाल करें' : 'निलंबित करें'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
