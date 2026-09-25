import React, { useEffect, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DashboardStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Images,
  Flag,
  Award,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Activity,
  Eye,
  TrendingUp,
  RefreshCw,
  Globe,
  Compass,
  Radio,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async (showLoader = false) => {
    if (!isSuperAdmin) return;
    if (showLoader) setIsRefreshing(true);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStats(false);
    } else {
      setIsLoading(false);
    }
  }, [isSuperAdmin, fetchStats]);

  // Periodic polling if auto-refresh is enabled (every 10 seconds)
  useEffect(() => {
    if (!autoRefresh || !isSuperAdmin) return;
    const interval = setInterval(() => {
      fetchStats(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, isSuperAdmin, fetchStats]);

  // If not superadmin, redirect to /admin/memories
  if (!isSuperAdmin) {
    return <Navigate to="/admin/memories" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
        <p className="text-sm font-devanagari-body text-muted">डैशबोर्ड सांख्यिकी लोड हो रही है...</p>
      </div>
    );
  }

  const visitorsData = stats?.visitors;
  const maxVisitorsInWeek = Math.max(
    ...(visitorsData?.dailyStats?.map((d) => d.visitors) || [1]),
    1
  );

  return (
    <div className="space-y-8">
      {/* Header with Live Status & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-devanagari-heading font-bold text-dark-950">
              व्यवस्थापक नियंत्रण कक्ष (Admin Overview)
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            यदुवंशी दुर्गा पूजा कपूरिपुर पोर्टल की वास्तविक समय स्थिति एवं मॉडरेशन डेटा।
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold font-devanagari-body border transition-all ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                : 'bg-cream-200 text-muted border-cream-300 hover:bg-cream-300'
            }`}
            title="हर 10 सेकंड में स्वतः लाइव डेटा अपडेट करें"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-muted'
              }`}
            />
            {autoRefresh ? 'स्वतः लाइव अपडेट चालू' : 'स्वतः अपडेट बंद'}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-dark-900 border border-cream-300 text-xs font-devanagari-body font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-maroon-700' : ''}`} />
            <span>ताज़ा करें</span>
          </button>

          <span className="text-[11px] text-muted font-devanagari-body hidden sm:inline-block">
            अपडेट: {lastUpdated.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔴 LIVE REAL-TIME TRAFFIC & VISITORS SECTION (NEW FEATURE) */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
            <h2 className="text-lg font-devanagari-heading font-bold text-dark-950">
              वास्तविक समय आगंतुक स्थिति (Live Visitors & Traffic)
            </h2>
          </div>
          <span className="text-xs font-devanagari-body text-muted bg-cream-200 px-2.5 py-1 rounded-md border border-cream-300">
            आंतरिक प्रशासनिक निगरानी
          </span>
        </div>

        {/* 3 Visitor Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Live Active Users Right Now */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-cream-50 p-5 rounded-2xl shadow-md border border-emerald-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 font-devanagari-body flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                वर्तमान में सक्रिय (Live Now)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-700/50 flex items-center justify-center text-emerald-200">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-4xl font-black font-devanagari-heading tracking-tight text-white">
                {visitorsData?.liveActive ?? 0}
              </div>
              <span className="text-xs font-devanagari-body text-emerald-200">
                भक्त / आगंतुक
              </span>
            </div>
            <p className="text-[11px] font-devanagari-body text-emerald-100/80">
              पिछले २.५ मिनट में वेबसाइट पर सक्रिय
            </p>
          </div>

          {/* 2. Today's Unique Visitors */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                आज के अद्वितीय आगंतुक (Today)
              </span>
              <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-4xl font-bold font-devanagari-heading text-dark-950">
                {visitorsData?.todayVisitors ?? 0}
              </div>
              <span className="text-xs font-devanagari-body text-muted">
                आगंतुक
              </span>
            </div>
            <p className="text-[11px] font-devanagari-body text-emerald-700 font-medium">
              आज का कुल ट्रैफिक
            </p>
          </div>

          {/* 3. All-time Total Visitors & Page Views */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                कुल आगंतुक (All-time Visitors)
              </span>
              <div className="w-8 h-8 rounded-lg bg-maroon-100 text-maroon-800 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-4xl font-bold font-devanagari-heading text-dark-950">
                {visitorsData?.totalVisitors ?? 0}
              </div>
              <span className="text-xs font-devanagari-body text-muted">
                कुल डिवाइस
              </span>
            </div>
            <p className="text-[11px] font-devanagari-body text-muted">
              कुल पेज व्यूज: <span className="font-semibold text-dark-900">{visitorsData?.totalPageViews ?? 0}</span>
            </p>
          </div>
        </div>

        {/* 7-Day Visual Traffic Graph & Top Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* 7-Day Daily Trend Chart (2 columns wide on large screens) */}
          <div className="lg:col-span-2 bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-maroon-700" />
                <h3 className="text-sm font-bold font-devanagari-heading text-dark-950">
                  दैनिक आगंतुक रुझान (पिछले ७ दिन)
                </h3>
              </div>
              <span className="text-xs text-muted font-devanagari-body">
                तारीख अनुसार आगंतुक
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-cream-300">
              {visitorsData?.dailyStats?.map((day, idx) => {
                const heightPercent = Math.max(
                  Math.round((day.visitors / maxVisitorsInWeek) * 100),
                  12
                );
                const isToday = idx === (visitorsData?.dailyStats?.length || 0) - 1;
                const formattedDate = new Date(day.date).toLocaleDateString('hi-IN', {
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-950 text-cream-50 text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg font-devanagari-body">
                      {day.date}: <span className="font-bold text-gold-400">{day.visitors} आगंतुक</span> ({day.pageViews} व्यूज)
                    </div>

                    <span className="text-[11px] font-bold text-dark-900 group-hover:text-maroon-700 transition-colors">
                      {day.visitors}
                    </span>

                    {/* Bar element */}
                    <div className="w-full max-w-[36px] bg-cream-200 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-500 h-28">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-maroon-800 to-gold-600 shadow-sm'
                            : 'bg-gradient-to-t from-cream-400 to-maroon-600/70 group-hover:from-cream-400 group-hover:to-maroon-700'
                        }`}
                      />
                    </div>

                    <span
                      className={`text-[10px] font-devanagari-body truncate ${
                        isToday ? 'font-bold text-maroon-800' : 'text-muted'
                      }`}
                    >
                      {isToday ? 'आज' : formattedDate}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-devanagari-body text-muted mt-3 px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-cream-400 to-maroon-600/70" />
                  <span>पिछले दिन</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-maroon-800 to-gold-600" />
                  <span className="font-semibold text-dark-900">आज</span>
                </div>
              </div>
              <span>गोपनीयता अनुकूल अनाम ट्रैकिंग</span>
            </div>
          </div>

          {/* Top Visited Sections (1 column wide) */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-gold-700" />
                <h3 className="text-sm font-bold font-devanagari-heading text-dark-950">
                  सर्वाधिक देखे गए अनुभाग (Top Pages)
                </h3>
              </div>

              <div className="space-y-3">
                {visitorsData?.popularPages && visitorsData.popularPages.length > 0 ? (
                  visitorsData.popularPages.slice(0, 5).map((page) => {
                    const totalViews = visitorsData.totalPageViews || 1;
                    const percent = Math.min(Math.round((page.views / totalViews) * 100), 100);

                    return (
                      <div key={page.path} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-devanagari-body">
                          <span className="font-medium text-dark-900 truncate max-w-[170px]" title={page.title}>
                            {page.title}
                          </span>
                          <span className="text-muted font-semibold">{page.views} व्यूज</span>
                        </div>
                        <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.max(percent, 8)}%` }}
                            className="h-full bg-gold-600 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-devanagari-body text-muted py-6 text-center">
                    अभी पर्याप्त पेज व्यू डेटा उपलब्ध नहीं है।
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-cream-300/80 text-[11px] font-devanagari-body text-muted flex items-center justify-between">
              <span>लाइव पथ ट्रैकिंग सक्रिय</span>
              <span className="text-emerald-700 font-semibold">● कनेक्टेड</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMMUNITY & CONTENT MANAGEMENT STATS */}
      {/* ========================================================= */}
      <div className="space-y-4 pt-4 border-t border-cream-300">
        <h2 className="text-lg font-devanagari-heading font-bold text-dark-950">
          सामग्री एवं समिति सांख्यिकी (Content & Community)
        </h2>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Memories Card */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                कुल स्मृतियाँ
              </span>
              <div className="w-9 h-9 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center">
                <Images className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold font-devanagari-heading text-dark-950 mb-2">
              {stats?.memories.total || 0}
            </div>
            <div className="flex items-center gap-3 text-xs font-devanagari-body text-muted">
              <span className="text-emerald-700 font-semibold">
                {stats?.memories.published || 0} प्रकाशित
              </span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">
                {stats?.memories.hidden || 0} समीक्षाधीन/छिपी
              </span>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                पंजीकृत भक्त
              </span>
              <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold font-devanagari-heading text-dark-950 mb-2">
              {stats?.users.total || 0}
            </div>
            <div className="flex items-center gap-3 text-xs font-devanagari-body text-muted">
              <span className="text-emerald-700 font-semibold">
                {stats?.users.verified || 0} सत्यापित
              </span>
              <span>•</span>
              <span className="text-red-700 font-semibold">
                {stats?.users.suspended || 0} निलंबित
              </span>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                सामग्री रिपोर्ट्स
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
                <Flag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold font-devanagari-heading text-dark-950 mb-2">
              {stats?.reports.pending || 0}
            </div>
            <div className="flex items-center gap-3 text-xs font-devanagari-body text-muted">
              <span className="text-red-700 font-semibold">
                {stats?.reports.pending || 0} लंबित समीक्षा
              </span>
              <span>•</span>
              <span>{stats?.reports.total || 0} कुल</span>
            </div>
          </div>

          {/* Committee Members Card */}
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider font-devanagari-body">
                समिति सदस्य
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold font-devanagari-heading text-dark-950 mb-2">
              {stats?.committee.total || 0}
            </div>
            <div className="text-xs font-devanagari-body text-muted">
              कार्यकारिणी पदाधिकारी
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/broadcast"
          className="bg-cream-100 p-6 rounded-2xl border border-gold-400/60 hover:border-gold-500 shadow-soft hover:shadow-md transition-all group flex items-start justify-between bg-gradient-to-br from-cream-50 to-gold-50/30"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-maroon-800 font-bold text-sm font-devanagari-heading">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>लाइव प्रसारण एवं शेड्यूल नियंत्रण</span>
            </div>
            <p className="text-xs font-devanagari-body text-muted leading-relaxed">
              लाइव आरती शुरू करें, आगामी प्रसारण शेड्यूल करें, चैट/दान टॉगल करें एवं पीक दर्शक इतिहास देखें।
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gold-700 group-hover:text-maroon-800 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/reports"
          className="bg-cream-100 p-6 rounded-2xl border border-cream-300 hover:border-red-400/60 shadow-soft transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm font-devanagari-body">
              <AlertCircle className="w-4 h-4" />
              <span>लंबित सामग्री रिपोर्ट्स की समीक्षा</span>
            </div>
            <p className="text-xs font-devanagari-body text-muted leading-relaxed">
              भक्तों द्वारा दर्ज की गई आपत्तियों की जाँच करें और अनुचित सामग्री को हटाएं या छिपाएं।
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-red-700 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/committee"
          className="bg-cream-100 p-6 rounded-2xl border border-cream-300 hover:border-gold-400/60 shadow-soft transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold-800 font-semibold text-sm font-devanagari-body">
              <Award className="w-4 h-4" />
              <span>समिति सदस्य सूची प्रबंधन</span>
            </div>
            <p className="text-xs font-devanagari-body text-muted leading-relaxed">
              नवीन पदाधिकारियों को जोड़ें, उनका क्रम बदलें या फोटो अपडेट करें।
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-gold-700 transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

