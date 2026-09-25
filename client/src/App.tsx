import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { useVisitorTracker } from './hooks/useVisitorTracker';

const VisitorTrackerManager: React.FC = () => {
  useVisitorTracker();
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <VisitorTrackerManager />
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

