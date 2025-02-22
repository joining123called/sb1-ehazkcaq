import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigationConfig, type NavigationItem } from '../lib/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  userFullName: string;
  userIdentifier: string;
  userRole: 'client' | 'writer' | 'admin';
}

export default function DashboardLayout({ 
  children, 
  title, 
  userFullName,
  userIdentifier,
  userRole
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = navigationConfig[userRole];

  const isActiveRoute = (item: NavigationItem) => {
    return location.pathname === item.route;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100/80">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
              <span className="text-sm font-semibold">AOP</span>
            </div>
            <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Platform
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.route}
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative
                  ${isActiveRoute(item) 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className={`
                  flex-shrink-0 w-5 h-5 mr-3 transition-all duration-200
                  ${isActiveRoute(item) 
                    ? 'text-indigo-600 scale-110' 
                    : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                  }
                `} />
                <span className="truncate">{item.name}</span>
                {isActiveRoute(item) && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Logout Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100/80">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50/80 transition-all duration-200 group"
            >
              <LogOut className="flex-shrink-0 w-5 h-5 mr-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Sign out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 bg-white/90 backdrop-blur-xl border-r border-gray-100/80
          transition-all duration-300 ease-out hidden lg:flex lg:flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100/80">
          <div className={`
            flex items-center transition-all duration-300
            ${!sidebarOpen ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}
          `}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
              <span className="text-sm font-semibold">AOP</span>
            </div>
            {sidebarOpen && (
              <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Platform
              </span>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              flex items-center justify-center p-2 rounded-lg
              text-gray-500 hover:text-gray-700 hover:bg-gray-100/80
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              ${!sidebarOpen ? 'w-full' : ''}
            `}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.route}
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
                  transition-all duration-200 group relative
                  ${!sidebarOpen ? 'justify-center' : ''}
                  ${isActiveRoute(item) 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                  }
                `}
              >
                <div className="relative">
                  <item.icon className={`
                    transition-all duration-200
                    ${!sidebarOpen ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                    ${isActiveRoute(item) 
                      ? 'text-indigo-600 scale-110' 
                      : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                    }
                  `} />
                  {isActiveRoute(item) && !sidebarOpen && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {isActiveRoute(item) && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Desktop Logout Section */}
        <div className={`
          p-4 border-t border-gray-100/80
          transition-all duration-300
        `}>
          <button
            onClick={handleSignOut}
            className={`
              flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
              text-red-600 hover:bg-red-50/80 transition-all duration-200 group
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <LogOut className={`
              transition-all duration-200 group-hover:-translate-x-0.5
              ${!sidebarOpen ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
            `} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
          <div className="flex items-center h-16 px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100/80 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-2xl mx-auto px-4">
              <div className={`
                absolute inset-y-0 left-4 flex items-center pl-4 pointer-events-none
                transition-all duration-200
                ${searchFocused ? 'text-indigo-500' : 'text-gray-400'}
              `}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="search"
                className={`
                  block w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50/50 
                  border-0 rounded-2xl shadow-sm
                  placeholder:text-gray-400
                  transition-all duration-200
                  focus:ring-2 focus:ring-indigo-500/20 focus:bg-white
                  ${searchFocused ? 'bg-white shadow-lg shadow-indigo-500/5' : ''}
                `}
                placeholder="Search anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className={`
                absolute right-7 top-1/2 -translate-y-1/2
                text-xs text-gray-400
                transition-opacity duration-200
                ${searchFocused ? 'opacity-100' : 'opacity-0'}
              `}>
                ⌘K
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100/80 transition-colors"
                >
                  <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 group">
                    <span className="text-sm font-medium group-hover:scale-110 transition-transform duration-200">
                      {userFullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 py-1.5 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100/80">
                      <div className="font-medium text-gray-900">{userFullName}</div>
                      <div className="text-sm text-gray-500">{userIdentifier}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}