import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public Pages
import { Home } from '../pages/Home';
import { Memories } from '../pages/Memories';
import { MemoryDetail } from '../pages/MemoryDetail';
import { Committee } from '../pages/Committee';
import { About } from '../pages/About';
import { Contact } from '../pages/Contact';
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsConditions } from '../pages/TermsConditions';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { VerifyEmail } from '../pages/VerifyEmail';
import { NotFound } from '../pages/NotFound';

// Protected User Pages
import { ShareMemory } from '../pages/ShareMemory';
import { MyMemories } from '../pages/MyMemories';
import { Profile } from '../pages/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminMemories } from '../pages/admin/AdminMemories';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminCommittee } from '../pages/admin/AdminCommittee';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public and Devotee Routes within Main Website Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
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
        <Route path="memories" element={<AdminMemories />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="committee" element={<AdminCommittee />} />
      </Route>
    </Routes>
  );
};
