import React, { useState, useEffect, useCallback } from 'react';
import { donationService, DonationSummaryStats } from '../../services/donationService';
import { Donation, DonationType, PaginationMeta } from '../../types';
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
  Radio,
  Landmark,
  Coins,
  Filter,
} from 'lucide-react';

export const AdminDonations: React.FC = () => {
  const toast = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<DonationSummaryStats>({
    totalCollected: 0,
    paidCount: 0,
    totalDonations: 0,
    donationsPaidCount: 0,
    totalDakshina: 0,
    dakshinaPaidCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Main Log Type Tab Switcher: 'donation' | 'dakshina' | 'all'
  const [activeTab, setActiveTab] = useState<'donation' | 'dakshina' | 'all'>('donation');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const fetchDonations = useCallback(async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    try {
      const typeParam = activeTab === 'all' ? undefined : (activeTab as DonationType);
      const res = await donationService.getDonations({
        page,
        limit: 15,
        type: typeParam,
        status: statusFilter || undefined,
        search: searchTerm.trim() || undefined,
      });

      if (res && res.success && res.data) {
        setDonations(res.data.donations || []);
        if (res.data.summary) {
          setSummary({
            totalCollected: Number(res.data.summary.totalCollected) || 0,
            paidCount: Number(res.data.summary.paidCount) || 0,
            totalDonations: Number(res.data.summary.totalDonations) || 0,
            donationsPaidCount: Number(res.data.summary.donationsPaidCount) || 0,
            totalDakshina: Number(res.data.summary.totalDakshina) || 0,
            dakshinaPaidCount: Number(res.data.summary.dakshinaPaidCount) || 0,
          });
        }
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'रिकॉर्ड लोड करने में समस्या आई');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, activeTab, statusFilter, searchTerm, toast]);

  useEffect(() => {
    fetchDonations(false);
  }, [fetchDonations]);

  // Reset page when tab or filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, searchTerm]);

  // Safe clipboard helper that works seamlessly on mobile devices
  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
      toast.success(`${label} कॉपी हो गया`);
    } catch {
      toast.info(`${label}: ${text}`);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {
      // quiet fallback
    }
  };

  // Safe date helper for mobile webviews
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: '-', time: '-' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: '-', time: '-' };
      return {
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: String(dateStr).slice(0, 10), time: '' };
    }
  };

  const exportToCSV = () => {
    if (donations.length === 0) {
      toast.error('एक्सपोर्ट करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है');
      return;
    }

    const headers = [
      'Record ID',
      'Type',
      'Donor Name',
      'Amount (INR)',
      'Status',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Live Stream Room',
      'Devotion Note / Message',
      'Date & Time',
    ];

    const rows = donations.map((d) => {
      const isDakshina = d.type === 'dakshina' || Boolean(d.liveSessionRoomName);
      const typeLabel = isDakshina ? 'पावन दक्षिणा (Dakshina)' : 'सामान्य पूजा दान (Donation)';
      const dt = formatDateTime(d.createdAt);
      return [
        d._id,
        `"${typeLabel}"`,
        `"${d.isAnonymous ? 'गुमनाम भक्त' : d.donorName || 'श्रद्धालु'}"`,
        d.amount || 0,
        d.status || 'paid',
        d.razorpayOrderId || '',
        d.razorpayPaymentId || '',
        d.liveSessionRoomName || (isDakshina ? 'Live Stream' : 'Mandap Seva'),
        `"${(d.message || '').replace(/"/g, '""')}"`,
        `"${dt.date} ${dt.time}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const prefix =
      activeTab === 'dakshina'
        ? 'durgapuja_live_dakshina'
        : activeTab === 'donation'
        ? 'durgapuja_puja_donations'
        : 'durgapuja_all_transactions';

    link.setAttribute('download', `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('रिकॉर्ड CSV फाइल सफलतापूर्वक डाउनलोड हो गई');
  };

  const safeSummary = summary || {
    totalCollected: 0,
    paidCount: 0,
    totalDonations: 0,
    donationsPaidCount: 0,
    totalDakshina: 0,
    dakshinaPaidCount: 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-950 text-gold-400 flex items-center justify-center shadow-md border border-gold-500/30 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl font-heading font-bold text-dark-950">
                दान एवं दक्षिणा वित्तीय रिकॉर्ड्स (Donation Logs)
              </h1>
              <p className="text-xs sm:text-sm font-body text-muted">
                सामान्य पूजा दान एवं लाइव दर्शन दक्षिणा का पृथक व पारदर्शी लेखा-जोखा
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

      {/* 1. Log Type Navigation Tabs */}
      <div className="bg-cream-100 p-1.5 rounded-2xl border border-cream-300 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Tab 1: General Puja Donations */}
          <button
            onClick={() => setActiveTab('donation')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'donation'
                ? 'bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-200 shadow-md ring-2 ring-gold-400/40'
                : 'text-dark-800 hover:bg-cream-200/80 hover:text-dark-950'
            }`}
          >
            <Landmark className={`w-4 h-4 shrink-0 ${activeTab === 'donation' ? 'text-gold-400' : 'text-maroon-800'}`} />
            <span>🏛️ सामान्य पूजा दान</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans font-bold ${
                activeTab === 'donation' ? 'bg-gold-500/30 text-gold-200' : 'bg-cream-300 text-dark-800'
              }`}
            >
              ₹{(safeSummary.totalDonations || 0).toLocaleString('en-IN')}
            </span>
          </button>

          {/* Tab 2: Live Darshan Dakshina */}
          <button
            onClick={() => setActiveTab('dakshina')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dakshina'
                ? 'bg-gradient-to-r from-rose-900 via-maroon-900 to-amber-950 text-gold-200 shadow-md ring-2 ring-amber-400/40'
                : 'text-dark-800 hover:bg-cream-200/80 hover:text-dark-950'
            }`}
          >
            <Radio className={`w-4 h-4 shrink-0 ${activeTab === 'dakshina' ? 'text-rose-400 animate-pulse' : 'text-rose-700'}`} />
            <span>🪔 पावन दक्षिणा</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans font-bold ${
                activeTab === 'dakshina' ? 'bg-amber-500/30 text-amber-200' : 'bg-cream-300 text-dark-800'
              }`}
            >
              ₹{(safeSummary.totalDakshina || 0).toLocaleString('en-IN')}
            </span>
          </button>

          {/* Tab 3: All Combined Records */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-emerald-900 to-teal-950 text-emerald-100 shadow-md ring-2 ring-emerald-400/40'
                : 'text-dark-800 hover:bg-cream-200/80 hover:text-dark-950'
            }`}
          >
            <Coins className={`w-4 h-4 shrink-0 ${activeTab === 'all' ? 'text-emerald-400' : 'text-emerald-800'}`} />
            <span>📋 संयुक्त रिकॉर्ड्स</span>
          </button>
        </div>

        <div className="text-[11px] font-body text-muted px-2 py-1 bg-cream-200/60 rounded-lg hidden lg:block">
          {activeTab === 'donation' && 'केवल सामान्य मंडप सेवा, भोग व महाप्रसाद दान'}
          {activeTab === 'dakshina' && 'केवल लाइव आरती दर्शन व सुपर चैट दक्षिणा'}
          {activeTab === 'all' && 'समस्त स्रोतों के कुल वित्तीय लेन-देन'}
        </div>
      </div>

      {/* 2. Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* KPI 1: General Puja Donations */}
        <div
          onClick={() => setActiveTab('donation')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl shadow-md border relative overflow-hidden transition-all ${
            activeTab === 'donation'
              ? 'bg-gradient-to-br from-maroon-900 via-maroon-800 to-amber-950 text-cream-50 border-gold-500/60 ring-2 ring-gold-400/40'
              : 'bg-cream-100 border-cream-300 hover:border-maroon-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider font-body flex items-center gap-1.5 ${
                activeTab === 'donation' ? 'text-amber-200' : 'text-maroon-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              कुल सामान्य पूजा दान
            </span>
            <Receipt className={`w-4 h-4 ${activeTab === 'donation' ? 'text-amber-300' : 'text-maroon-700'}`} />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-heading font-black ${
              activeTab === 'donation' ? 'text-amber-100' : 'text-dark-950'
            }`}
          >
            ₹{(safeSummary.totalDonations || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-300/30 text-[11px] font-body">
            <span className={activeTab === 'donation' ? 'text-amber-200/90' : 'text-muted'}>
              {safeSummary.donationsPaidCount || 0} सफल समर्पण
            </span>
            <span className={activeTab === 'donation' ? 'text-amber-300 font-semibold' : 'text-maroon-800 font-semibold'}>
              मंडप व भोग सेवा
            </span>
          </div>
        </div>

        {/* KPI 2: Live Darshan Dakshina */}
        <div
          onClick={() => setActiveTab('dakshina')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl shadow-md border relative overflow-hidden transition-all ${
            activeTab === 'dakshina'
              ? 'bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-cream-50 border-rose-500/60 ring-2 ring-rose-400/40'
              : 'bg-cream-100 border-cream-300 hover:border-rose-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider font-body flex items-center gap-1.5 ${
                activeTab === 'dakshina' ? 'text-rose-200' : 'text-rose-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500 shrink-0" />
              कुल पावन दक्षिणा
            </span>
            <Sparkles className={`w-4 h-4 ${activeTab === 'dakshina' ? 'text-gold-300' : 'text-rose-700'}`} />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-heading font-black ${
              activeTab === 'dakshina' ? 'text-gold-100' : 'text-dark-950'
            }`}
          >
            ₹{(safeSummary.totalDakshina || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-300/30 text-[11px] font-body">
            <span className={activeTab === 'dakshina' ? 'text-rose-200/90' : 'text-muted'}>
              {safeSummary.dakshinaPaidCount || 0} लाइव आहुतियाँ
            </span>
            <span className={activeTab === 'dakshina' ? 'text-gold-300 font-semibold' : 'text-rose-800 font-semibold'}>
              आरती सुपर चैट
            </span>
          </div>
        </div>

        {/* KPI 3: Grand Combined Total */}
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl shadow-md border relative overflow-hidden transition-all ${
            activeTab === 'all'
              ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-cream-50 border-emerald-500/60 ring-2 ring-emerald-400/40'
              : 'bg-cream-100 border-cream-300 hover:border-emerald-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider font-body flex items-center gap-1.5 ${
                activeTab === 'all' ? 'text-emerald-200' : 'text-emerald-800'
              }`}
            >
              <Coins className="w-3.5 h-3.5 shrink-0" />
              संयुक्त संचित समर्पण
            </span>
            <TrendingUp className={`w-4 h-4 ${activeTab === 'all' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-heading font-black ${
              activeTab === 'all' ? 'text-emerald-100' : 'text-dark-950'
            }`}
          >
            ₹{(safeSummary.totalCollected || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-300/30 text-[11px] font-body">
            <span className={activeTab === 'all' ? 'text-emerald-200/90' : 'text-muted'}>
              {safeSummary.paidCount || 0} कुल सफल भुगतान
            </span>
            <span className={activeTab === 'all' ? 'text-emerald-300 font-semibold' : 'text-emerald-800 font-semibold'}>
              समस्त स्रोत
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="bg-cream-100 p-3 sm:p-4 rounded-2xl border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-soft">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="नाम, @username, Order ID से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-dark-900 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted font-body flex items-center gap-1 mr-1 hidden sm:inline-flex">
            <Filter className="w-3.5 h-3.5" />
          </span>
          {[
            { id: '', label: 'सभी (All)' },
            { id: 'paid', label: 'सफल (Paid)' },
            { id: 'created', label: 'प्रक्रियाधीन (Pending)' },
            { id: 'failed', label: 'असफल (Failed)' },
          ].map((statusTab) => (
            <button
              key={statusTab.id}
              onClick={() => setStatusFilter(statusTab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === statusTab.id
                  ? 'bg-maroon-800 text-cream-50 shadow-xs font-bold'
                  : 'bg-cream-200 text-dark-700 hover:bg-cream-300'
              }`}
            >
              {statusTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Transactions Data Container */}
      <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted font-body">वित्तीय रिकॉर्ड्स लोड हो रहे हैं...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center p-6">
            {activeTab === 'dakshina' ? (
              <Radio className="w-12 h-12 text-rose-400 mx-auto mb-2 opacity-50" />
            ) : (
              <HeartHandshake className="w-12 h-12 text-muted mx-auto mb-2 opacity-50" />
            )}
            <h3 className="font-heading font-bold text-dark-900 text-base mb-1">
              {activeTab === 'dakshina'
                ? 'कोई पावन दक्षिणा रिकॉर्ड नहीं मिला'
                : activeTab === 'donation'
                ? 'कोई सामान्य पूजा दान रिकॉर्ड नहीं मिला'
                : 'कोई वित्तीय रिकॉर्ड नहीं मिला'}
            </h3>
            <p className="text-xs text-muted font-body max-w-sm mx-auto">
              {searchTerm || statusFilter
                ? 'दिए गए फ़िल्टर या खोज शब्दों के अनुसार कोई लेन-देन उपलब्ध नहीं है।'
                : activeTab === 'dakshina'
                ? 'लाइव स्ट्रीम में श्रद्धालुओं द्वारा दी गई दक्षिणा यहाँ प्रदर्शित होगी।'
                : 'भक्तों द्वारा समर्पित किए गए दान यहाँ प्रदर्शित होंगे।'}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View (Hidden on phones) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-body divide-y divide-cream-300">
                <thead className="bg-cream-200/80 text-dark-900 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">श्रद्धालु (Devotee)</th>
                    <th className="px-4 py-3">प्रकार (Fund Type)</th>
                    <th className="px-4 py-3">राशि (Amount)</th>
                    <th className="px-4 py-3">स्थिति (Status)</th>
                    <th className="px-4 py-3">Razorpay विवरण (Order / Payment ID)</th>
                    <th className="px-4 py-3">स्रोत / विवरण (Purpose & Note)</th>
                    <th className="px-4 py-3">दिनांक व समय (Date & Time)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/80 bg-cream-50/60">
                  {donations.map((item) => {
                    const isPaid = item.status === 'paid';
                    const isCreated = item.status === 'created';
                    const isFailed = item.status === 'failed';
                    const isDakshina = item.type === 'dakshina' || Boolean(item.liveSessionRoomName);
                    const userObj = item?.user && typeof item.user === 'object' ? (item.user as any) : null;
                    const donorDisplayName = item.isAnonymous ? 'गुमनाम भक्त' : (item.donorName || userObj?.name || 'श्रद्धालु');
                    const dt = formatDateTime(item.createdAt);

                    return (
                      <tr key={item._id} className="hover:bg-cream-100/80 transition-colors">
                        {/* 1. Devotee Name & Profile */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {userObj?.avatar ? (
                              <img
                                src={userObj.avatar}
                                alt={donorDisplayName}
                                className="w-8 h-8 rounded-full object-cover border border-gold-400/60 shadow-xs"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon-800 to-maroon-950 text-gold-200 font-bold flex items-center justify-center text-xs border border-maroon-300">
                                {item.isAnonymous ? '?' : (donorDisplayName.charAt(0).toUpperCase() || 'D')}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-dark-900 flex items-center gap-1.5">
                                {donorDisplayName}
                                {item.isAnonymous && (
                                  <span className="text-[9px] text-amber-900 bg-amber-100 px-1 rounded font-semibold border border-amber-300">
                                    Anonymous
                                  </span>
                                )}
                              </p>
                              {!item.isAnonymous && userObj?.username && (
                                <p className="text-[10px] text-muted font-mono font-medium">
                                  @{userObj.username}
                                </p>
                              )}
                              {userObj?.email && (
                                <p className="text-[10px] text-muted truncate max-w-[150px]">
                                  {userObj.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Type Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isDakshina ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-rose-100 to-amber-100 text-rose-900 border border-rose-300 shadow-xs">
                              <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
                              पावन दक्षिणा
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                              <Landmark className="w-3 h-3 text-maroon-800" />
                              पूजा दान
                            </span>
                          )}
                        </td>

                        {/* 3. Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-heading font-black text-sm text-maroon-900">
                          ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
                        </td>

                        {/* 4. Status Badge */}
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

                        {/* 5. Razorpay Order / Payment ID */}
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          <div className="space-y-1">
                            {item.razorpayPaymentId && (
                              <div className="flex items-center gap-1 text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <span className="font-bold text-[9px] uppercase text-emerald-700">Pay ID:</span>
                                <span className="truncate max-w-[140px]">{item.razorpayPaymentId}</span>
                                <button
                                  onClick={() => copyToClipboard(item.razorpayPaymentId!, 'Payment ID')}
                                  className="hover:text-dark-900 cursor-pointer"
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
                                className="hover:text-dark-900 cursor-pointer"
                                title="Copy Order ID"
                              >
                                <Copy className="w-3 h-3 ml-0.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 6. Purpose / Room & Devotion Note */}
                        <td className="px-4 py-3.5 max-w-xs">
                          {item.liveSessionRoomName ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mb-1">
                              <Radio className="w-3 h-3 text-red-600" />
                              लाइव सत्र: {item.liveSessionRoomName}
                            </span>
                          ) : (
                            <span className="text-[10px] text-maroon-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mb-1 inline-block">
                              सामान्य पूजा सेवा
                            </span>
                          )}
                          {item.message && (
                            <p className="text-[11px] text-dark-800 italic line-clamp-2">
                              "{item.message}"
                            </p>
                          )}
                        </td>

                        {/* 7. Date & Time */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-muted text-[11px]">
                          <div>{dt.date}</div>
                          <div className="text-[10px] text-muted/70">{dt.time}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View (Optimized for phones) */}
            <div className="md:hidden divide-y divide-cream-200">
              {donations.map((item) => {
                const isPaid = item.status === 'paid';
                const isCreated = item.status === 'created';
                const isFailed = item.status === 'failed';
                const isDakshina = item.type === 'dakshina' || Boolean(item.liveSessionRoomName);
                const userObj = item?.user && typeof item.user === 'object' ? (item.user as any) : null;
                const donorDisplayName = item.isAnonymous ? 'गुमनाम भक्त' : (item.donorName || userObj?.name || 'श्रद्धालु');
                const dt = formatDateTime(item.createdAt);

                return (
                  <div key={item._id} className="p-3.5 bg-cream-50/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-maroon-800 text-gold-200 font-bold flex items-center justify-center text-xs border border-gold-400/40 shrink-0">
                          {item.isAnonymous ? '?' : (donorDisplayName.charAt(0).toUpperCase() || 'D')}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-bold text-dark-900 text-xs sm:text-sm truncate">
                            {donorDisplayName}
                          </p>
                          {userObj?.username && (
                            <p className="text-[10px] font-mono text-muted truncate">@{userObj.username}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-heading font-black text-sm text-maroon-900 block">
                          ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
                        </span>
                        {isPaid && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                            सफल (Paid)
                          </span>
                        )}
                        {isCreated && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                            प्रक्रियाधीन
                          </span>
                        )}
                        {isFailed && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-block">
                            असफल
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cream-200/80">
                      <div>
                        {isDakshina ? (
                          <span className="text-[10px] font-bold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                            पावन दक्षिणा
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <Landmark className="w-2.5 h-2.5 text-amber-700" />
                            पूजा दान
                          </span>
                        )}
                      </div>

                      <span className="text-muted text-[10px]">
                        {dt.date} • {dt.time}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-[11px] text-dark-800 italic bg-white p-2 rounded-xl border border-cream-200">
                        "{item.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-muted bg-cream-200/60 px-2 py-1 rounded-lg">
                      <span className="truncate max-w-[200px]">Order: {item.razorpayOrderId}</span>
                      <button
                        onClick={() => copyToClipboard(item.razorpayOrderId, 'Order ID')}
                        className="text-maroon-800 font-bold ml-1 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 sm:p-4 bg-cream-100 border-t border-cream-300 flex items-center justify-between text-xs font-body">
            <span className="text-muted text-[11px] sm:text-xs">
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

export default AdminDonations;
