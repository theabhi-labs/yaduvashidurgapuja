import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Core Landing Page (static for instantaneous First Contentful Paint)
import { Home } from '../pages/Home';

// Devotional Suspense Fallback Loader
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-maroon-800 text-gold-300 flex items-center justify-center font-bold text-xl shadow-lg border border-gold-500/40 animate-pulse">
      🕉️
    </div>
    <p className="text-xs sm:text-sm font-heading font-bold text-maroon-900 animate-pulse">
      Loading page... Please wait
    </p>
  </div>
);

// Lazy-loaded Public Pages (Separates heavy LiveKit and external dependencies from initial bundle)
const LiveDarshan = React.lazy(() =>
  import('../pages/LiveDarshan').then((m) => ({ default: m.LiveDarshan }))
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

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public and Devotee Routes within Main Website Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live-darshan" element={<LiveDarshan />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/:id" element={<MemoryDetail />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

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
          <Route index element={<AdminDashboard />} />
          <Route path="live-darshan" element={<AdminLiveBroadcast />} />
          <Route path="memories" element={<AdminMemories />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="committee" element={<AdminCommittee />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

