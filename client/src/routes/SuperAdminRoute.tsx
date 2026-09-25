import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
        <p className="text-sm font-body text-muted">Checking super administrator permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return <Navigate to="/admin/memories" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
