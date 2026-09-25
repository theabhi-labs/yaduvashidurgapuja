import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const VISITOR_STORAGE_KEY = 'ydp_visitor_token_v1';

const getOrCreateVisitorId = (): string => {
  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId) {
      const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      visitorId = `v_${Date.now()}_${randomStr}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return `v_anon_${Date.now()}`;
  }
};

export const useVisitorTracker = () => {
  const location = useLocation();
  const visitorIdRef = useRef<string>(getOrCreateVisitorId());
  const lastPingTimeRef = useRef<number>(0);

  const sendHeartbeat = async (currentPath: string) => {
    try {
      const now = Date.now();
      // Throttle pings to at most once every 10 seconds per tab
      if (now - lastPingTimeRef.current < 10000 && currentPath === location.pathname) {
        return;
      }
      lastPingTimeRef.current = now;

      await api.post('/analytics/heartbeat', {
        visitorId: visitorIdRef.current,
        path: currentPath || window.location.pathname || '/',
      });
    } catch {
      // Fail silently to never disrupt visitor experience
    }
  };

  // Ping on page/route changes
  useEffect(() => {
    sendHeartbeat(location.pathname);
  }, [location.pathname]);

  // Periodic heartbeat every 45s while tab is open & on visibility change
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat(window.location.pathname);
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat(window.location.pathname);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
