import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { SuperAdminRoute } from './SuperAdminRoute';

// Core Landing Page (static for instantaneous First Contentful Paint)
import { Home } from '../pages/Home';

import { motion } from 'framer-motion';

// Devotional Suspense Fallback Loader
const PageLoadingFallback: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 select-none"
  >
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-950 text-gold-300 flex items-center justify-center font-bold text-2xl shadow-xl border-2 border-gold-500/40 animate-pulse">
        🕉️
      </div>
      <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-sm -z-10 animate-ping" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-heading font-bold text-maroon-900 tracking-wide">
        ॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥
      </p>
      <p className="text-xs font-body text-maroon-700/80 animate-pulse">
        पृष्ठ लोड हो रहा है, कृपया प्रतीक्षा करें...
      </p>
    </div>
  </motion.div>
);

// Lazy-loaded Public Pages (Separates heavy LiveKit and external dependencies from initial bundle)
const LiveDarshan = React.lazy(() =>
  import('../pages/LiveDarshan').then((m) => ({ default: m.LiveDarshan }))
);
const Donation = React.lazy(() =>
  import('../pages/Donation').then((m) => ({ default: m.Donation }))
);
const Memories = React.lazy(() =>
  import('../pages/Memories').then((m) => ({ default: m.Memories }))
);
const MemoryDetail = React.lazy(() =>
  import('../pages/MemoryDetail').then((m) => ({ default: m.MemoryDetail }))
);
const Committee = React.lazy(() =>
  import('../pages/Committee').then((m) => ({ default: m.Committee }))
);
const About = React.lazy(() =>
  import('../pages/About').then((m) => ({ default: m.About }))
);
const Contact = React.lazy(() =>
  import('../pages/Contact').then((m) => ({ default: m.Contact }))
);
const PrivacyPolicy = React.lazy(() =>
  import('../pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsConditions = React.lazy(() =>
  import('../pages/TermsConditions').then((m) => ({ default: m.TermsConditions }))
);
const Login = React.lazy(() =>
  import('../pages/Login').then((m) => ({ default: m.Login }))
);
const Register = React.lazy(() =>
  import('../pages/Register').then((m) => ({ default: m.Register }))
);
const ForgotPassword = React.lazy(() =>
  import('../pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
);
const VerifyOtp = React.lazy(() =>
  import('../pages/VerifyOtp').then((m) => ({ default: m.VerifyOtp }))
);
const ResetPassword = React.lazy(() =>
  import('../pages/ResetPassword').then((m) => ({ default: m.ResetPassword }))
);
const VerifyEmail = React.lazy(() =>
  import('../pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail }))
);
const NotFound = React.lazy(() =>
  import('../pages/NotFound').then((m) => ({ default: m.NotFound }))
);

// Lazy-loaded Protected Devotee Pages
const ShareMemory = React.lazy(() =>
  import('../pages/ShareMemory').then((m) => ({ default: m.ShareMemory }))
);
const MyMemories = React.lazy(() =>
  import('../pages/MyMemories').then((m) => ({ default: m.MyMemories }))
);
const Profile = React.lazy(() =>
  import('../pages/Profile').then((m) => ({ default: m.Profile }))
);

// Lazy-loaded Admin Pages
const AdminDashboard = React.lazy(() =>
  import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminDonations = React.lazy(() =>
  import('../pages/admin/AdminDonations').then((m) => ({ default: m.AdminDonations }))
);
const AdminLiveBroadcast = React.lazy(() =>
  import('../pages/admin/AdminLiveBroadcast').then((m) => ({ default: m.AdminLiveBroadcast }))
);
const AdminMemories = React.lazy(() =>
  import('../pages/admin/AdminMemories').then((m) => ({ default: m.AdminMemories }))
);
const AdminUsers = React.lazy(() =>
  import('../pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers }))
);
const AdminReports = React.lazy(() =>
  import('../pages/admin/AdminReports').then((m) => ({ default: m.AdminReports }))
);
const AdminCommittee = React.lazy(() =>
  import('../pages/admin/AdminCommittee').then((m) => ({ default: m.AdminCommittee }))
);
const AdminAds = React.lazy(() =>
  import('../pages/admin/AdminAds').then((m) => ({ default: m.AdminAds }))
);
const AdminHeroBanners = React.lazy(() =>
  import('../pages/admin/AdminHeroBanners').then((m) => ({ default: m.AdminHeroBanners }))
);
const AdminPujaSchedules = React.lazy(() =>
  import('../pages/admin/AdminPujaSchedules').then((m) => ({ default: m.AdminPujaSchedules }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public and Devotee Routes within Main Website Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live-darshan" element={<LiveDarshan />} />
          <Route path="/live darshan" element={<LiveDarshan />} />
          <Route path="/live%20darshan" element={<LiveDarshan />} />
          <Route path="/live" element={<LiveDarshan />} />
          <Route path="/donate" element={<Donation />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/:id" element={<MemoryDetail />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/forgot%20password" element={<ForgotPassword />} />
          <Route path="/forget%20password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/verifyotp" element={<VerifyOtp />} />
          <Route path="/verify%20otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/reset%20password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verifyemail" element={<VerifyEmail />} />

          {/* Protected Devotee Actions */}
          <Route
            path="/share-memory"
            element={
              <ProtectedRoute>
                <ShareMemory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-memories"
            element={
              <ProtectedRoute>
                <MyMemories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Panel Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <SuperAdminRoute>
                <AdminDashboard />
              </SuperAdminRoute>
            }
          />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="live-darshan" element={<AdminLiveBroadcast />} />
          <Route path="live darshan" element={<AdminLiveBroadcast />} />
          <Route path="live%20darshan" element={<AdminLiveBroadcast />} />
          <Route path="live" element={<AdminLiveBroadcast />} />
          <Route path="broadcast" element={<AdminLiveBroadcast />} />
          <Route path="aarti-timings" element={<AdminPujaSchedules />} />
          <Route path="banners" element={<AdminHeroBanners />} />
          <Route path="memories" element={<AdminMemories />} />
          <Route
            path="ads"
            element={
              <SuperAdminRoute>
                <AdminAds />
              </SuperAdminRoute>
            }
          />
          <Route
            path="users"
            element={
              <SuperAdminRoute>
                <AdminUsers />
              </SuperAdminRoute>
            }
          />
          <Route path="reports" element={<AdminReports />} />
          <Route path="committee" element={<AdminCommittee />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

