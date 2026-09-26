import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import {
  LayoutDashboard,
  Images,
  Users,
  Flag,
  Award,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Crown,
  Radio,
  Megaphone,
  Sparkles,
  Bell,
  HeartHandshake,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isSuperAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // If standard ADMIN attempts to open /admin (Overview), /admin/ads, or /admin/users, redirect them to /admin/memories
  useEffect(() => {
    if (
      user &&
      !isSuperAdmin &&
      (location.pathname === '/admin' ||
        location.pathname === '/admin/ads' ||
        location.pathname === '/admin/users')
    ) {
      navigate('/admin/memories', { replace: true });
    }
  }, [user, isSuperAdmin, location.pathname, navigate]);

  // Define nav items conditionally based on role
  const adminNavItems = isSuperAdmin
    ? [
        { name: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Donations & Seva', path: '/admin/donations', icon: <HeartHandshake className="w-5 h-5" /> },
        { name: 'Live Broadcast', path: '/admin/live-darshan', icon: <Radio className="w-5 h-5" /> },
        { name: 'Schedule (समय सारणी)', path: '/admin/aarti-timings', icon: <Bell className="w-5 h-5" /> },
        { name: 'Hero Posters', path: '/admin/banners', icon: <Sparkles className="w-5 h-5" /> },
        { name: 'Memories', path: '/admin/memories', icon: <Images className="w-5 h-5" /> },
        { name: 'In-Feed Ads', path: '/admin/ads', icon: <Megaphone className="w-5 h-5" /> },
        { name: 'Users & Roles', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { name: 'Reports', path: '/admin/reports', icon: <Flag className="w-5 h-5" /> },
        { name: 'Committee', path: '/admin/committee', icon: <Award className="w-5 h-5" /> },
      ]
    : [
        { name: 'Donations & Seva', path: '/admin/donations', icon: <HeartHandshake className="w-5 h-5" /> },
        { name: 'Live Broadcast', path: '/admin/live-darshan', icon: <Radio className="w-5 h-5" /> },
        { name: 'Schedule (समय सारणी)', path: '/admin/aarti-timings', icon: <Bell className="w-5 h-5" /> },
        { name: 'Hero Posters', path: '/admin/banners', icon: <Sparkles className="w-5 h-5" /> },
        { name: 'Memories', path: '/admin/memories', icon: <Images className="w-5 h-5" /> },
        { name: 'Reports', path: '/admin/reports', icon: <Flag className="w-5 h-5" /> },
        { name: 'Committee', path: '/admin/committee', icon: <Award className="w-5 h-5" /> },
      ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-maroon-900 text-cream-100 p-4 flex items-center justify-between border-b border-maroon-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-maroon-800 p-1 flex items-center justify-center border border-amber-400/40 shadow-sm overflow-hidden">
            <img
              src="/favicon.svg"
              alt="यदुवंशी दुर्गा पूजा"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm">
              {isSuperAdmin ? 'Super Admin Panel' : 'Moderator Panel'}
            </span>
            <span className="text-[10px] text-gold-400 font-body">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg text-cream-200 hover:bg-maroon-800"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-dark-900 text-cream-100 flex flex-col justify-between p-5 border-r border-dark-700 transition-transform duration-300 shadow-2xl md:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="pb-6 mb-6 border-b border-dark-700 flex items-center justify-between">
            <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-maroon-800 p-1 flex items-center justify-center border border-amber-400/40 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/favicon.svg"
                  alt="यदुवंशी दुर्गा पूजा"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-cream-50 leading-tight group-hover:text-amber-300 transition-colors">
                  Kapooripur Puja
                </span>
                <span
                  className={`text-[11px] font-body font-semibold flex items-center gap-1 ${
                    isSuperAdmin ? 'text-gold-400' : 'text-emerald-400'
                  }`}
                >
                  {isSuperAdmin ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-gold-400" />
                      <span>Super Admin</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Admin</span>
                    </>
                  )}
                </span>
              </div>
            </Link>
            {/* Close ✕ button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl text-cream-300 hover:text-white hover:bg-dark-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
                    isActive
                      ? 'bg-maroon-700 text-cream-50 font-semibold shadow-sm'
                      : 'text-cream-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <span className={isActive ? 'text-gold-400' : 'text-cream-400'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions in Sidebar */}
        <div className="pt-6 border-t border-dark-700 space-y-2">
          <div className="px-3.5 py-2 bg-dark-800/80 rounded-xl mb-2 text-xs font-body">
            <span className="text-muted block text-[10px]">Logged in as:</span>
            <span className="font-semibold text-cream-100 truncate block">{user?.name}</span>
            <span className="text-gold-400 text-[10px] uppercase tracking-wider font-mono block">
              {user?.role}
            </span>
          </div>

          <Link
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-gold-400 hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

