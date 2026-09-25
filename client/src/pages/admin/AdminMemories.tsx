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
      toast.error(err.message || 'Failed to load memories');
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
      toast.success(`Memory status changed to '${newStatus}'`);
      setMemories((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus as any } : m))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update memory status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await memoryService.deleteMemory(deletingId);
      toast.success('Memory deleted permanently');
      setMemories((prev) => prev.filter((m) => m._id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete memory');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-dark-950">
            Memories Moderation
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted mt-1">
            Review uploaded devotional photos, change status, and moderate community submissions.
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
            placeholder="Search caption or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All', value: '' },
            { label: 'Published', value: 'published' },
            { label: 'Hidden / Pending', value: 'hidden' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all shrink-0 ${
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
          <p className="text-xs font-body text-muted">Loading memories...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-body text-muted">No memories found</p>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-semibold text-muted uppercase font-body tracking-wider">
                  <th className="p-4">Photo</th>
                  <th className="p-4">Caption & Year</th>
                  <th className="p-4">Devotee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80 text-xs font-body">
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
                        Year {mem.year}
                      </span>
                      <p className="line-clamp-2 text-dark-800">{mem.caption}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-dark-900 block">
                        {mem.userId?.name || 'Anonymous'}
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
                        {mem.status === 'published' ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/memories/${mem._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-muted hover:text-dark-900 hover:bg-cream-200"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {mem.status === 'published' ? (
                          <button
                            onClick={() => handleStatusChange(mem._id, 'hidden')}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(mem._id, 'published')}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingId(mem._id)}
                          className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                          title="Delete"
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
                Total {pagination.total} memories (Page {pagination.page} of {pagination.totalPages})
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
        title="Confirm Delete Memory"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-dark-800 leading-relaxed">
            Are you sure you want to permanently delete this memory? This action will remove the image and records completely.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMemories;
