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
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isSuperAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If standard ADMIN attempts to open /admin (Overview), redirect them to /admin/memories
  useEffect(() => {
    if (user && !isSuperAdmin && location.pathname === '/admin') {
      navigate('/admin/memories', { replace: true });
    }
  }, [user, isSuperAdmin, location.pathname, navigate]);

  // Define nav items conditionally based on role
  const adminNavItems = isSuperAdmin
    ? [
        { name: 'नियंत्रण कक्ष (Overview)', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'स्मृतियाँ (Memories)', path: '/admin/memories', icon: <Images className="w-5 h-5" /> },
        { name: 'उपयोगकर्ता व भूमिकाएँ (Users)', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { name: 'रिपोर्ट्स (Reports)', path: '/admin/reports', icon: <Flag className="w-5 h-5" /> },
        { name: 'समिति (Committee)', path: '/admin/committee', icon: <Award className="w-5 h-5" /> },
      ]
    : [
        { name: 'स्मृतियाँ (Memories)', path: '/admin/memories', icon: <Images className="w-5 h-5" /> },
        { name: 'रिपोर्ट्स (Reports)', path: '/admin/reports', icon: <Flag className="w-5 h-5" /> },
        { name: 'समिति (Committee)', path: '/admin/committee', icon: <Award className="w-5 h-5" /> },
      ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-200 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-maroon-900 text-cream-100 p-4 flex items-center justify-between border-b border-maroon-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-maroon-700 flex items-center justify-center text-gold-400 font-bold border border-gold-500/40">
            य
          </div>
          <div className="flex flex-col">
            <span className="font-devanagari-heading font-bold text-sm">
              {isSuperAdmin ? 'मुख्य व्यवस्थापक पैनल' : 'समिति मॉडरेटर पैनल'}
            </span>
            <span className="text-[10px] text-gold-400 font-devanagari-body">
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

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-dark-900 text-cream-100 flex flex-col justify-between p-5 border-r border-dark-700 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="pb-6 mb-6 border-b border-dark-700">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon-700 flex items-center justify-center text-gold-400 font-devanagari-heading font-bold text-xl border border-gold-500/40">
                य
              </div>
              <div className="flex flex-col">
                <span className="font-devanagari-heading font-bold text-base text-cream-50 leading-tight">
                  यदुवंशी दुर्गा पूजा
                </span>
                <span
                  className={`text-[11px] font-devanagari-body font-semibold flex items-center gap-1 ${
                    isSuperAdmin ? 'text-gold-400' : 'text-emerald-400'
                  }`}
                >
                  {isSuperAdmin ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-gold-400" />
                      <span>मुख्य व्यवस्थापक (Super Admin)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>समिति व्यवस्थापक (Admin)</span>
                    </>
                  )}
                </span>
              </div>
            </Link>
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-devanagari-body font-medium transition-all ${
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
          <div className="px-3.5 py-2 bg-dark-800/80 rounded-xl mb-2 text-xs font-devanagari-body">
            <span className="text-muted block text-[10px]">लॉगिन खाता:</span>
            <span className="font-semibold text-cream-100 truncate block">{user?.name}</span>
            <span className="text-gold-400 text-[10px] uppercase tracking-wider font-mono block">
              {user?.role}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-gold-400 hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य वेबसाइट पर लौटें</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>व्यवस्थापक लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
