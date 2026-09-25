import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  Menu,
  X,
  PlusCircle,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Bookmark,
  ChevronDown,
  Info,
  Phone,
  FileText,
  Shield,
  Heart,
} from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Memories', path: '/memories' },
    { name: 'Committee', path: '/committee' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'दान (Donate)', path: '/donate' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        !isHomePage ? 'hidden md:block ' : ''
      }${
        isScrolled
          ? 'bg-cream-100/95 backdrop-blur-md shadow-sm border-b border-cream-300/80 py-2.5 sm:py-3'
          : 'bg-cream-200 border-b border-cream-300/50 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-maroon-800 flex items-center justify-center text-amber-400 font-bold text-lg sm:text-xl shadow-sm group-hover:scale-105 transition-transform border border-amber-500/40">
              Y
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-lg text-maroon-900 leading-tight group-hover:text-maroon-800 tracking-tight">
                Yaduvashi Durga Puja
              </span>
              <span className="text-[10px] sm:text-xs text-amber-800 font-semibold tracking-wide">
                Kapooripur • Digital Archive
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-maroon-700/10 text-maroon-900 font-semibold'
                      : 'text-dark-800 hover:text-maroon-900 hover:bg-cream-300/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Share CTA button */}
            <Link to="/share-memory">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="font-semibold"
              >
                Share Memory
              </Button>
            </Link>

            {/* Auth Dropdown or Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-cream-100 hover:bg-cream-300 border border-cream-300 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <div className="w-7 h-7 rounded-lg bg-maroon-700 text-cream-50 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-dark-900 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-cream-50 rounded-2xl shadow-xl border border-cream-300 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-cream-200">
                      <p className="text-xs font-semibold text-dark-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">{user.email}</p>
                      {isSuperAdmin ? (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          SUPER ADMIN
                        </span>
                      ) : isAdmin ? (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-maroon-100 text-maroon-800 border border-maroon-200">
                          ADMIN
                        </span>
                      ) : null}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-dark-900 hover:bg-cream-200 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-amber-600" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/my-memories"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-dark-900 hover:bg-cream-200 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-maroon-700" />
                        <span>My Memories</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-maroon-800 hover:bg-maroon-50 transition-colors border-t border-cream-200"
                        >
                          <ShieldAlert className="w-4 h-4 text-maroon-700" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-cream-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls: Clean Menu */}
          <div className="flex md:hidden items-center">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-dark-900 hover:bg-cream-300 focus:outline-none focus:ring-2 focus:ring-maroon-500"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-maroon-800" />
              ) : (
                <Menu className="w-6 h-6 text-maroon-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Secondary Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-3 pb-5 border-t border-cream-300/80 mt-2 space-y-3 animate-fade-in">

            {/* Secondary Informational Links */}
            <div className="bg-cream-100/90 rounded-2xl border border-cream-300 p-2 divide-y divide-cream-200/80">
              <Link
                to="/donate"
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors"
              >
                <Heart className="w-4 h-4 text-amber-600 fill-amber-500/30" />
                <span>माँ दुर्गा पूजा दान सेवा (Donate)</span>
              </Link>

              <Link
                to="/about"
                className="flex items-center gap-3 px-3 py-2.5 text-xs text-dark-900 hover:bg-cream-200 rounded-xl transition-colors"
              >
                <Info className="w-4 h-4 text-maroon-700" />
                <span>About & History</span>
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-3 px-3 py-2.5 text-xs text-dark-900 hover:bg-cream-200 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4 text-maroon-700" />
                <span>Contact & Support</span>
              </Link>

              <Link
                to="/privacy"
                className="flex items-center gap-3 px-3 py-2.5 text-xs text-dark-900 hover:bg-cream-200 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 text-maroon-700" />
                <span>Privacy Policy</span>
              </Link>

              <Link
                to="/terms"
                className="flex items-center gap-3 px-3 py-2.5 text-xs text-dark-900 hover:bg-cream-200 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 text-maroon-700" />
                <span>Terms & Conditions</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-maroon-900 hover:bg-maroon-50 rounded-xl transition-colors bg-maroon-50/50"
                >
                  <ShieldAlert className="w-4 h-4 text-maroon-700" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </div>

            {/* User Login/Logout Footer inside Drawer */}
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-xs text-muted truncate max-w-[180px]">
                  Logged in as: {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-700 font-bold flex items-center gap-1 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
