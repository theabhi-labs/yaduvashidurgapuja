import React, { useState, useEffect, useCallback } from 'react';
import { donationService } from '../../services/donationService';
import { Donation, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import {
  HeartHandshake,
  Search,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Receipt,
  User,
  Radio,
} from 'lucide-react';

export const AdminDonations: React.FC = () => {
  const toast = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<{ totalCollected: number; paidCount: number }>({
    totalCollected: 0,
    paidCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const fetchDonations = useCallback(async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    try {
      const res = await donationService.getDonations({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: searchTerm.trim() || undefined,
      });

      if (res.success && res.data) {
        setDonations(res.data.donations || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'दान रिकॉर्ड लोड करने में समस्या आई');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, statusFilter, searchTerm, toast]);

  useEffect(() => {
    fetchDonations(false);
  }, [fetchDonations]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} कॉपी हो गया`);
  };

  const exportToCSV = () => {
    if (donations.length === 0) {
      toast.error('एक्सपोर्ट करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है');
      return;
    }

    const headers = ['Donation ID', 'Donor Name', 'Amount (INR)', 'Status', 'Order ID', 'Payment ID', 'Room', 'Message', 'Date'];
    const rows = donations.map((d) => [
      d._id,
      `"${d.isAnonymous ? 'गुमनाम भक्त' : d.donorName}"`,
      d.amount,
      d.status,
      d.razorpayOrderId || '',
      d.razorpayPaymentId || '',
      d.liveSessionRoomName || 'General',
      `"${(d.message || '').replace(/"/g, '""')}"`,
      `"${new Date(d.createdAt).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `durgapuja_donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('दान रिकॉर्ड CSV फाइल डाउनलोड हो गई');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-maroon-800 text-gold-400 flex items-center justify-center shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-dark-950">
                दान एवं सेवा रिकॉर्ड (Donation Logs)
              </h1>
              <p className="text-xs sm:text-sm font-body text-muted">
                Razorpay द्वारा प्राप्त सभी ऑनलाइन दान, पावती एवं लेन-देन का संपूर्ण विवरण
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDonations(true)}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-maroon-700' : ''}`} />}
          >
            रीफ्रेश
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={exportToCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            CSV एक्सपोर्ट
          </Button>
        </div>
      </div>

      {/* 1. Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-cream-50 p-5 rounded-2xl shadow-md border border-emerald-700/60 relative overflow-hidden">
          <div className="absolute right-3 -bottom-3 text-emerald-700/20 pointer-events-none">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 font-body">
              कुल संचित दान राशि
            </span>
            <Receipt className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-100">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-300/80 font-body mt-1">
            सफल लेन-देन से प्राप्त कुल सहयोग
          </p>
        </div>

        {/* Paid Count */}
        <div className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-amber-950 text-cream-50 p-5 rounded-2xl shadow-md border border-maroon-700/60 relative overflow-hidden">
          <div className="absolute right-3 -bottom-3 text-maroon-700/20 pointer-events-none">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200 font-body">
              सफल समर्पण (Paid Count)
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-amber-100">
            {summary.paidCount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-300/80 font-body mt-1">
            श्रद्धालुओं द्वारा सफलतापूर्वक पूर्ण किए गए दान
          </p>
        </div>

        {/* Total Listed in Query */}
        <div className="bg-cream-100 border border-cream-300 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-dark-700 font-body">
              दर्ज रिकॉर्ड्स (Query Total)
            </span>
            <User className="w-4 h-4 text-maroon-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-dark-900">
            {pagination?.total || 0}
          </div>
          <p className="text-[11px] text-muted font-body mt-1">
            वर्तमान फिल्टर के अनुसार कुल दान प्रविष्टियाँ
          </p>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-cream-100 p-3 sm:p-4 rounded-2xl border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="नाम, Order ID या Payment ID से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-dark-900"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'सभी (All)' },
            { id: 'paid', label: 'सफल (Paid)' },
            { id: 'created', label: 'प्रक्रियाधीन (Pending)' },
            { id: 'failed', label: 'असफल (Failed)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-maroon-800 text-cream-50 shadow-xs'
                  : 'bg-cream-200 text-dark-700 hover:bg-cream-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Donations Data Table */}
      <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted font-body">दान रिकॉर्ड लोड हो रहे हैं...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center p-6">
            <HeartHandshake className="w-12 h-12 text-muted mx-auto mb-2 opacity-50" />
            <h3 className="font-heading font-bold text-dark-900 text-base mb-1">
              कोई दान रिकॉर्ड नहीं मिला
            </h3>
            <p className="text-xs text-muted font-body max-w-sm mx-auto">
              {searchTerm || statusFilter
                ? 'दिए गए फ़िल्टर या खोज शब्दों के अनुसार कोई लेन-देन उपलब्ध नहीं है।'
                : 'अभी तक कोई ऑनलाइन दान रिकॉर्ड दर्ज नहीं हुआ है।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body divide-y divide-cream-300">
              <thead className="bg-cream-200/80 text-dark-900 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">श्रद्धालु (Devotee)</th>
                  <th className="px-4 py-3">राशि (Amount)</th>
                  <th className="px-4 py-3">स्थिति (Status)</th>
                  <th className="px-4 py-3">Razorpay विवरण (Order / Payment ID)</th>
                  <th className="px-4 py-3">स्रोत / संदेश (Purpose & Note)</th>
                  <th className="px-4 py-3">दिनांक व समय (Date & Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200/80 bg-cream-50/60">
                {donations.map((item) => {
                  const isPaid = item.status === 'paid';
                  const isCreated = item.status === 'created';
                  const isFailed = item.status === 'failed';

                  return (
                    <tr key={item._id} className="hover:bg-cream-100/80 transition-colors">
                      {/* 1. Devotee Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-maroon-100 text-maroon-900 font-bold flex items-center justify-center text-xs border border-maroon-200">
                            {item.isAnonymous ? '?' : (item.donorName?.charAt(0).toUpperCase() || 'D')}
                          </div>
                          <div>
                            <p className="font-bold text-dark-900">
                              {item.isAnonymous ? 'गुमनाम भक्त' : item.donorName}
                            </p>
                            {item.isAnonymous && (
                              <span className="text-[9px] text-amber-800 bg-amber-100/80 px-1 rounded font-semibold">
                                Anonymous
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-heading font-black text-sm text-maroon-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>

                      {/* 3. Status Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            सफल (Paid)
                          </span>
                        )}
                        {isCreated && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            प्रक्रियाधीन (Created)
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            असफल (Failed)
                          </span>
                        )}
                      </td>

                      {/* 4. Razorpay Order / Payment ID */}
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <div className="space-y-1">
                          {item.razorpayPaymentId && (
                            <div className="flex items-center gap-1 text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <span className="font-bold text-[9px] uppercase text-emerald-700">Pay ID:</span>
                              <span className="truncate max-w-[140px]">{item.razorpayPaymentId}</span>
                              <button
                                onClick={() => copyToClipboard(item.razorpayPaymentId!, 'Payment ID')}
                                className="hover:text-dark-900"
                                title="Copy Payment ID"
                              >
                                <Copy className="w-3 h-3 ml-0.5" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-dark-700 bg-cream-100 px-1.5 py-0.5 rounded border border-cream-300">
                            <span className="font-bold text-[9px] uppercase text-muted">Order:</span>
                            <span className="truncate max-w-[140px]">{item.razorpayOrderId}</span>
                            <button
                              onClick={() => copyToClipboard(item.razorpayOrderId, 'Order ID')}
                              className="hover:text-dark-900"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3 h-3 ml-0.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 5. Purpose & Message */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {item.liveSessionRoomName ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mb-1">
                            <Radio className="w-3 h-3 text-red-600" />
                            लाइव दर्शन ({item.liveSessionRoomName})
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted font-medium block">सामान्य पूजा सेवा</span>
                        )}
                        {item.message && (
                          <p className="text-[11px] text-dark-800 italic line-clamp-2">
                            "{item.message}"
                          </p>
                        )}
                      </td>

                      {/* 6. Date & Time */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted text-[11px]">
                        <div>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[10px] text-muted/70">{new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 bg-cream-100 border-t border-cream-300 flex items-center justify-between text-xs font-body">
            <span className="text-muted">
              कुल {pagination.total} में से पृष्ठ {pagination.page} / {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                पिछला
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                अगला
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
