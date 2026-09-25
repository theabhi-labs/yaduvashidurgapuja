import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { memoryService } from '../../services/memoryService';
import { Memory, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  EyeOff,
  Trash2,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const AdminMemories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const toast = useToast();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getAdminMemories({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: debouncedSearch.trim() || undefined,
      });

      if (res.success) {
        setMemories(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'स्मृतियाँ लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, toast]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminService.updateMemoryStatus(id, newStatus);
      toast.success(`स्मृति की स्थिति बदलकर '${newStatus}' कर दी गई`);
      setMemories((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus as any } : m))
      );
    } catch (err: any) {
      toast.error(err.message || 'स्थिति अपडेट करने में त्रुटि');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await memoryService.deleteMemory(deletingId);
      toast.success('स्मृति स्थायी रूप से हटा दी गई');
      setMemories((prev) => prev.filter((m) => m._id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'हटाने में त्रुटि हुई');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-devanagari-heading font-bold text-dark-950">
            स्मृतियाँ प्रबंधन (Memories Moderation)
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            सभी अपलोड की गई तस्वीरों की समीक्षा, स्थिति परिवर्तन और हटाने का अधिकार।
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-soft flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="विवरण खोजें..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-devanagari-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'सभी', value: '' },
            { label: 'प्रकाशित (Published)', value: 'published' },
            { label: 'छिपी/समीक्षाधीन (Hidden)', value: 'hidden' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-devanagari-body font-medium transition-all shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-maroon-700 text-white font-bold'
                  : 'bg-cream-200 text-dark-800 hover:bg-cream-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
          <p className="text-xs font-devanagari-body text-muted">स्मृतियाँ लोड हो रही हैं...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-devanagari-body text-muted">कोई स्मृति नहीं मिली</p>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-semibold text-muted uppercase font-devanagari-body tracking-wider">
                  <th className="p-4">तस्वीर</th>
                  <th className="p-4">विवरण व वर्ष</th>
                  <th className="p-4">श्रद्धालु (Devotee)</th>
                  <th className="p-4">तिथि</th>
                  <th className="p-4">स्थिति</th>
                  <th className="p-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80 text-xs font-devanagari-body">
                {memories.map((mem) => (
                  <tr key={mem._id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4">
                      <img
                        src={getImageUrl(mem.thumbnailUrl || mem.imageUrl)}
                        alt=""
                        className="w-16 h-12 rounded-lg object-cover border border-cream-300"
                      />
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="font-bold text-maroon-900 block mb-0.5">
                        वर्ष {mem.year}
                      </span>
                      <p className="line-clamp-2 text-dark-800">{mem.caption}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-dark-900 block">
                        {mem.userId?.name || 'अज्ञात'}
                      </span>
                      <span className="text-[11px] text-muted">{mem.userId?.email}</span>
                    </td>
                    <td className="p-4 text-muted whitespace-nowrap">
                      {formatDate(mem.createdAt)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          mem.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {mem.status === 'published' ? 'प्रकाशित' : 'छिपा हुआ'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/memories/${mem._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-muted hover:text-dark-900 hover:bg-cream-200"
                          title="देखें"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {mem.status === 'published' ? (
                          <button
                            onClick={() => handleStatusChange(mem._id, 'hidden')}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                            title="छिपाएं (Hide)"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(mem._id, 'published')}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            title="प्रकाशित करें (Publish)"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingId(mem._id)}
                          className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                          title="हटाएं (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-cream-300 flex items-center justify-between">
              <span className="text-xs text-muted">
                कुल {pagination.total} स्मृतियाँ (पृष्ठ {pagination.page} / {pagination.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="व्यवस्थापक स्मृति हटाने की पुष्टि"
      >
        <div className="space-y-4">
          <p className="text-sm font-devanagari-body text-dark-800 leading-relaxed">
            क्या आप वाकई इस स्मृति को स्थायी रूप से हटाना चाहते हैं? यह क्रिया सर्वर से फ़ाइलों को भी हटा देगी।
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeletingId(null)}
            >
              रद्द करें
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              हाँ, हटा दें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
