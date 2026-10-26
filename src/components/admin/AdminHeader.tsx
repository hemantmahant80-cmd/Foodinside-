import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  ChevronDown,
  RefreshCw,
  Bot,
  LogIn
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onToggleMobile: () => void;
  onOpenLogout: () => void;
  onSwitchToStore?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobile,
  onOpenLogout,
  onSwitchToStore,
}) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    simulateIncomingOrder,
    setSelectedOrderForDetail,
    orders,
  } = useAdminData();
  const { user, signInWithGoogle, signInAsAdmin, logOut } = useAuth();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Operations Dashboard';
      case 'live_orders':
        return 'Live Kitchen & Delivery Orders';
      case 'analytics':
        return 'Performance & Revenue Analytics';
      case 'menu_stock':
        return 'Menu Stock Management (In / Out)';
      case 'restaurants_hub':
        return 'Cloud Kitchens & Partner Hubs';
      case 'franchise_branches':
        return 'Franchise Network & Branches';
      case 'rider_app':
        return 'Rider Fleet & Dispatch Console';
      case 'store':
        return 'Storefront Settings & Preview';
      default:
        return 'Admin Dashboard';
    }
  };

  const handleNotificationClick = (orderId?: string, notifId?: string) => {
    if (notifId) markNotificationRead(notifId);
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setActiveTab('live_orders');
        setSelectedOrderForDetail(order);
      }
    }
    setNotifDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left zone: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>FoodInside</span>
            <span className="text-slate-300">/</span>
            <span className="text-orange-600 font-semibold capitalize">Admin Operations</span>
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Middle zone: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search orders, dishes, customers, riders..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right zone: Live status, Simulate Order, Notifications & Admin Profile */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Live Kitchen Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Store Live • Auto-Dispatch</span>
        </div>

        {/* Simulate Order Button (Quick Operations action) */}
        <button
          onClick={simulateIncomingOrder}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold transition-all active:scale-95 shadow-xs"
          title="Simulate incoming order from customer store"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span className="hidden sm:inline">+ Sim Order</span>
        </button>

        {/* Quick Gemini AI Assistant Shortcut */}
        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            activeTab === 'ai_assistant'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
          }`}
          title="Open Gemini AI Assistant"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Gemini AI</span>
        </button>

        {/* Customer Storefront Link */}
        <button
          onClick={() => {
            if (onSwitchToStore) {
              onSwitchToStore();
            } else {
              window.location.href = '/';
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
          title="Open Customer Storefront"
        >
          <Store className="w-3.5 h-3.5 text-slate-600" />
          <span>Customer Store</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  <p className="text-[11px] text-slate-500">Live order & kitchen operational alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.orderId, n.id)}
                      className={`p-3.5 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'order' && (
                          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                        {n.type === 'rider' && (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {(n.type === 'stock' || n.type === 'system') && (
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                            {n.timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Area Dropdown / Google Sign In */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 overflow-hidden shrink-0 border border-orange-400/40 shadow-xs">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.displayName || 'Admin'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user.displayName ? user.displayName.split(' ')[0] : 'Admin'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none">
                  {user.email === 'hemantmahant80@gmail.com' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.displayName || 'FoodInside Admin'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">
                    Firebase Authenticated
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onSwitchToStore) {
                        onSwitchToStore();
                      } else {
                        window.location.href = '/';
                      }
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span>Customer Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logOut();
                    }}
                    className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                  >
                    Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign In</span>
            </button>
            <button
              onClick={signInAsAdmin}
              className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              title="Quick access as Super Admin (Hemant Mahant)"
            >
              <span>Admin Login</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
