import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { Report, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate, getImageUrl } from '../../utils/helpers';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const toast = useToast();

  // Action modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<string>('dismiss');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getReports({
        page,
        limit: 15,
        status: statusFilter || undefined,
      });

      if (res.success) {
        setReports(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      const nextStatus = actionType === 'dismiss' ? 'dismissed' : 'reviewed';
      await adminService.handleReport(selectedReport._id, {
        status: nextStatus,
        adminNotes: adminNotes.trim(),
        action: actionType,
      });

      toast.success('Report moderation action applied successfully');
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-dark-950">
          Content Reports Moderation
        </h1>
        <p className="text-xs sm:text-sm font-body text-muted mt-1">
          Review devotee-submitted flags, investigate objectionable content, and take moderation action.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {[
          { label: 'Pending Review', value: 'pending' },
          { label: 'Reviewed / Actioned', value: 'reviewed' },
          { label: 'Dismissed', value: 'dismissed' },
          { label: 'All Reports', value: '' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-body font-medium transition-all shrink-0 ${
              statusFilter === tab.value
                ? 'bg-maroon-700 text-white font-bold shadow-sm'
                : 'bg-cream-100 text-dark-800 hover:bg-cream-300 border border-cream-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
          <p className="text-xs font-body text-muted">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-body text-muted">
            {statusFilter === 'pending'
              ? 'No pending reports found. All community content is clean and safe.'
              : 'No reports found in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const memory = rep.memoryId as any;
            return (
              <div
                key={rep._id}
                className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Memory Preview Thumbnail */}
                <div className="flex items-start gap-4 flex-1">
                  {memory?.imageUrl ? (
                    <img
                      src={getImageUrl(memory.imageUrl)}
                      alt=""
                      className="w-24 h-20 rounded-xl object-cover border border-cream-300 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-20 rounded-xl bg-cream-200 border flex items-center justify-center text-xs text-muted">
                      Removed
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs font-body">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide text-[10px]">
                        Reason: {rep.reason}
                      </span>
                      <span className="text-muted">
                        Reported: {formatDate(rep.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-dark-900 font-medium line-clamp-2">
                      {memory?.caption || 'Memory caption not available'}
                    </p>

                    {rep.description && (
                      <p className="text-xs text-muted italic bg-cream-50 p-2 rounded-lg border border-cream-200">
                        "Reporter details: {rep.description}"
                      </p>
                    )}

                    <div className="text-muted text-[11px] pt-1">
                      Reporter:{' '}
                      <span className="font-semibold text-dark-800">
                        {rep.reporterId?.name || 'Anonymous'}
                      </span>{' '}
                      ({rep.reporterId?.email})
                    </div>
                  </div>
                </div>

                {/* Status & Action Trigger */}
                <div className="flex md:flex-col items-end justify-between gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-cream-200">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      rep.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : rep.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-cream-300 text-muted'
                    }`}
                  >
                    {rep.status === 'pending'
                      ? 'Pending'
                      : rep.status === 'reviewed'
                      ? 'Reviewed'
                      : 'Dismissed'}
                  </span>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(rep);
                          setActionType('hide_memory');
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 flex items-center justify-between">
              <span className="text-xs text-muted">
                Total {pagination.total} reports (Page {pagination.page} of {pagination.totalPages})
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

      {/* Action Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Report Moderation Action"
      >
        <div className="space-y-4 font-body text-xs sm:text-sm">
          <p className="text-dark-900 font-medium">
            Please choose the appropriate action to resolve this report:
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'hide_memory',
                title: 'Hide Memory',
                desc: 'Memory will be hidden from public feed and only visible to the owner and admins.',
              },
              {
                id: 'delete_memory',
                title: 'Delete Memory Permanently',
                desc: 'The memory image and records will be deleted completely from the database.',
              },
              {
                id: 'dismiss',
                title: 'Dismiss Report',
                desc: 'Content complies with community guidelines; no changes will be made.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                  actionType === opt.id
                    ? 'border-maroon-600 bg-maroon-50 text-maroon-950'
                    : 'border-cream-300 hover:bg-cream-200/60'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value={opt.id}
                  checked={actionType === opt.id}
                  onChange={(e) => setActionType(e.target.value)}
                  className="mr-2 text-maroon-700"
                />
                <span className="font-bold">{opt.title}</span>
                <p className="text-xs text-muted mt-1 pl-5">{opt.desc}</p>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1">
              Admin Notes (Optional):
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes regarding this review..."
              className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAction}
              isLoading={isSubmitting}
            >
              Apply Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
