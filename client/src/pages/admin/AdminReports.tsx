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
      toast.error(err.message || 'रिपोर्ट लोड करने में समस्या');
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

      toast.success('रिपोर्ट पर कार्यवाही पूरी हुई');
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'कार्यवाही विफल हुई');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-devanagari-heading font-bold text-dark-950">
          सामग्री रिपोर्ट्स समीक्षा (Content Reports)
        </h1>
        <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
          भक्तों द्वारा दर्ज की गई आपत्तियों की जाँच एवं त्वरित समाधान।
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { label: 'लंबित समीक्षा (Pending)', value: 'pending' },
          { label: 'स्वीकृत/कार्रवाई पूर्ण (Reviewed)', value: 'reviewed' },
          { label: 'खारिज (Dismissed)', value: 'dismissed' },
          { label: 'सभी (All)', value: '' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-devanagari-body font-medium transition-all ${
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
          <p className="text-xs font-devanagari-body text-muted">रिपोर्ट्स लोड हो रही हैं...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-devanagari-body text-muted">
            {statusFilter === 'pending'
              ? 'कोई लंबित रिपोर्ट नहीं है। सभी सामग्रियां स्वच्छ एवं सुरक्षित हैं।'
              : 'इस श्रेणी में कोई रिपोर्ट उपलब्ध नहीं है।'}
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
                      हटा दिया गया
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs font-devanagari-body">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide text-[10px]">
                        कारण: {rep.reason}
                      </span>
                      <span className="text-muted">
                        दर्ज तिथि: {formatDate(rep.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-dark-900 font-medium line-clamp-2">
                      {memory?.caption || 'स्मृति का विवरण उपलब्ध नहीं है'}
                    </p>

                    {rep.description && (
                      <p className="text-xs text-muted italic bg-cream-50 p-2 rounded-lg border border-cream-200">
                        "रिपोर्टर विवरण: {rep.description}"
                      </p>
                    )}

                    <div className="text-muted text-[11px] pt-1">
                      रिपोर्टकर्ता:{' '}
                      <span className="font-semibold text-dark-800">
                        {rep.reporterId?.name || 'अज्ञात'}
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
                      ? 'लंबित'
                      : rep.status === 'reviewed'
                      ? 'समीक्षा पूर्ण'
                      : 'खारिज'}
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
                        कार्यवाही करें
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
                कुल {pagination.total} रिपोर्ट्स (पृष्ठ {pagination.page} / {pagination.totalPages})
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
        title="रिपोर्ट पर मॉडरेशन कार्यवाही"
      >
        <div className="space-y-4 font-devanagari-body text-xs sm:text-sm">
          <p className="text-dark-900 font-medium">
            कृपया इस रिपोर्ट के निवारण हेतु उचित विकल्प चुनें:
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'hide_memory',
                title: 'स्मृति को छिपाएं (Hide Memory)',
                desc: 'स्मृति सार्वजनिक फ़ीड से हट जाएगी, केवल मालिक और व्यवस्थापक देख पाएंगे।',
              },
              {
                id: 'delete_memory',
                title: 'स्मृति को स्थायी रूप से हटाएं (Delete Memory)',
                desc: 'तस्वीर एवं रिकॉर्ड डेटाबेस से पूर्णतः नष्ट कर दिया जाएगा।',
              },
              {
                id: 'dismiss',
                title: 'रिपोर्ट को खारिज करें (Dismiss Report)',
                desc: 'सामग्री नियमों के अनुकूल है, कोई बदलाव नहीं किया जाएगा।',
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
              व्यवस्थापक टिप्पणी (वैकल्पिक):
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="समीक्षा से संबंधित आंतरिक टिप्पणी..."
              className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-devanagari-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              variant="outline"
              size="md"
              onClick={() => setSelectedReport(null)}
            >
              रद्द करें
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAction}
              isLoading={isSubmitting}
            >
              कार्यवाही सुरक्षित करें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
