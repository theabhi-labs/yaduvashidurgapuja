import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, Users, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/helpers';

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render inside admin portal
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/share-memory');
    } else {
      navigate('/login?redirect=/share-memory');
    }
  };

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream-100/95 backdrop-blur-lg border-t border-cream-300/80 shadow-[0_-4px_20px_rgba(74,4,4,0.08)] safe-area-pb"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {/* 1. Home Feed */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive
                ? 'text-maroon-800 scale-105'
                : 'text-dark-700/60 hover:text-dark-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Home className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon-700 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-body mt-0.5 ${isActive ? 'font-bold text-maroon-900' : 'font-medium'}`}>
                Home
              </span>
            </>
          )}
        </NavLink>

        {/* 2. Explore / Memories Grid */}
        <NavLink
          to="/memories"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive
                ? 'text-maroon-800 scale-105'
                : 'text-dark-700/60 hover:text-dark-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Compass className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon-700 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-body mt-0.5 ${isActive ? 'font-bold text-maroon-900' : 'font-medium'}`}>
                Memories
              </span>
            </>
          )}
        </NavLink>

        {/* 3. Center Instagram-Style Create / Add Button */}
        <button
          onClick={handleAddClick}
          aria-label="Add New Memory"
          className="flex flex-col items-center justify-center flex-1 py-1 group"
        >
          <div className="w-10 h-10 -mt-3 rounded-2xl bg-gradient-to-tr from-maroon-800 via-maroon-700 to-amber-600 text-cream-50 flex items-center justify-center shadow-md shadow-maroon-900/20 group-hover:scale-110 active:scale-95 transition-all border-2 border-cream-100">
            <PlusSquare className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-body mt-0.5 font-bold text-maroon-800">
            Share
          </span>
        </button>

        {/* 4. Committee */}
        <NavLink
          to="/committee"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive
                ? 'text-maroon-800 scale-105'
                : 'text-dark-700/60 hover:text-dark-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Users className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon-700 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-body mt-0.5 ${isActive ? 'font-bold text-maroon-900' : 'font-medium'}`}>
                Committee
              </span>
            </>
          )}
        </NavLink>

        {/* 5. User Profile or Login */}
        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive
                ? 'text-maroon-800 scale-105'
                : 'text-dark-700/60 hover:text-dark-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {isAuthenticated ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden ${
                    isActive 
                      ? 'ring-2 ring-maroon-700 bg-maroon-800 text-cream-50' 
                      : 'bg-maroon-100 text-maroon-900 ring-1 ring-cream-400'
                  }`}>
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                ) : (
                  <UserIcon className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                )}

                {isAdmin && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-cream-100" title="Admin" />
                )}

                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-maroon-700 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-body mt-0.5 ${isActive ? 'font-bold text-maroon-900' : 'font-medium'}`}>
                {isAuthenticated ? 'Profile' : 'Login'}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
