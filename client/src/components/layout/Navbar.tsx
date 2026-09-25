import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
} from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
    { name: 'मुख्य पृष्ठ (Home)', path: '/' },
    { name: 'स्मृतियाँ (Memories)', path: '/memories' },
    { name: 'समिति (Committee)', path: '/committee' },
    { name: 'परिचय (About)', path: '/about' },
    { name: 'संपर्क (Contact)', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-cream-100/95 backdrop-blur-md shadow-sm border-b border-cream-300/80 py-3'
          : 'bg-cream-200 border-b border-cream-300/50 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-maroon-700 flex items-center justify-center text-gold-400 font-devanagari-heading font-bold text-xl shadow-sm group-hover:scale-105 transition-transform border border-gold-500/40">
              य
            </div>
            <div className="flex flex-col">
              <span className="font-devanagari-heading font-bold text-base sm:text-lg text-maroon-900 leading-tight group-hover:text-maroon-800">
                यदुवंशी दुर्गा पूजा
              </span>
              <span className="text-[11px] sm:text-xs font-devanagari-body text-gold-700 font-semibold tracking-wide">
                कपूरिपुर • डिजिटल स्मृति संचय
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
                  className={`px-3.5 py-2 rounded-xl text-sm font-devanagari-body font-medium transition-all ${
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

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Share CTA button */}
            <Link to="/share-memory">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="font-devanagari-body font-semibold"
              >
                अपनी याद साझा करें
              </Button>
            </Link>

            {/* Auth Dropdown or Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-cream-100 hover:bg-cream-300 border border-cream-300 transition-all focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <div className="w-7 h-7 rounded-lg bg-maroon-700 text-gold-300 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0)
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
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-maroon-100 text-maroon-800 border border-maroon-200">
                          व्यवस्थापक (ADMIN)
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-dark-900 hover:bg-cream-200 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gold-600" />
                        <span>मेरी प्रोफाइल</span>
                      </Link>

                      <Link
                        to="/my-memories"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-dark-900 hover:bg-cream-200 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-maroon-700" />
                        <span>मेरी यादें (My Memories)</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-maroon-800 hover:bg-maroon-50 transition-colors border-t border-cream-200"
                        >
                          <ShieldAlert className="w-4 h-4 text-maroon-700" />
                          <span>व्यवस्थापक पैनल (Admin)</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-cream-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>लॉगआउट</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  लॉगिन
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-dark-900 hover:bg-cream-300 focus:outline-none focus:ring-2 focus:ring-maroon-500"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-maroon-800" />
              ) : (
                <Menu className="w-6 h-6 text-maroon-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6 border-t border-cream-300/80 mt-3 space-y-3">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2.5 rounded-xl text-sm font-devanagari-body font-medium transition-all ${
                      isActive
                        ? 'bg-maroon-700/10 text-maroon-900 font-bold'
                        : 'text-dark-900 hover:bg-cream-300/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-cream-300/80 flex flex-col gap-2">
              <Link to="/share-memory">
                <Button
                  variant="gold"
                  size="md"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  className="w-full font-devanagari-body"
                >
                  अपनी याद साझा करें
                </Button>
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link to="/my-memories">
                    <Button
                      variant="secondary"
                      size="md"
                      leftIcon={<Bookmark className="w-4 h-4 text-maroon-700" />}
                      className="w-full font-devanagari-body"
                    >
                      मेरी यादें
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button
                        variant="primary"
                        size="md"
                        leftIcon={<ShieldAlert className="w-4 h-4" />}
                        className="w-full font-devanagari-body"
                      >
                        व्यवस्थापक पैनल (Admin)
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                    className="w-full font-devanagari-body"
                  >
                    लॉगआउट
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="md" className="w-full">
                    लॉगिन / साइन अप
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
