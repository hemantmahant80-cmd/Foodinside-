import React from 'react';
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  PackageCheck,
  UtensilsCrossed,
  Building2,
  Bike,
  ShoppingBag,
  LogOut,
  X,
  ChevronRight,
  Flame,
  ShieldCheck,
  ExternalLink,
  Bot,
  Video,
  Image as ImageIcon,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { AdminModuleTab } from '../../types';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenLogout: () => void;
  onSwitchToStore?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenLogout,
  onSwitchToStore,
}) => {
  const { activeTab, setActiveTab, metrics, menuItems } = useAdminData();
  const { user, signInWithGoogle, logOut } = useAuth();

  const outOfStockCount = menuItems.filter(i => !i.inStock).length;

  const navItems: { id: AdminModuleTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'live_orders',
      label: 'Live Orders',
      icon: Clock,
      badge: metrics.newOrders > 0 ? `${metrics.newOrders} New` : `${metrics.cookingOrders} Active`,
      badgeColor: metrics.newOrders > 0 ? 'bg-orange-500 text-white' : 'bg-amber-500/20 text-amber-300',
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'menu_stock',
      label: 'Menu Stock (In/Out)',
      icon: PackageCheck,
      badge: outOfStockCount > 0 ? `${outOfStockCount} Out` : 'All In',
      badgeColor: outOfStockCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400',
    },
    { id: 'restaurants_hub', label: 'Restaurants Hub', icon: UtensilsCrossed },
    { id: 'franchise_branches', label: 'Franchise & Branches', icon: Building2 },
    {
      id: 'rider_app',
      label: 'Rider App & Dispatch',
      icon: Bike,
      badge: '5 Online',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'ai_assistant',
      label: 'Gemini AI Assistant',
      icon: Bot,
      badge: 'Argon + Flash',
      badgeColor: 'bg-orange-500/20 text-orange-400',
    },
    {
      id: 'video_studio',
      label: 'Video Studio',
      icon: Video,
      badge: 'Omni Flash',
      badgeColor: 'bg-purple-500/20 text-purple-400',
    },
    {
      id: 'image_studio',
      label: 'Food Image Studio',
      icon: ImageIcon,
      badge: 'Nano Banana',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    { id: 'store', label: 'Store Front', icon: ShoppingBag },
  ];

  const handleNavClick = (id: AdminModuleTab) => {
    if (id === 'logout') {
      onOpenLogout();
    } else {
      setActiveTab(id);
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center text-xl font-bold tracking-tight">
              <span className="text-white">food</span>
              <span className="text-orange-500">inside</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Good Food • Better Mood
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Portal Tag */}
      <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-300">Operations Console</span>
        </div>
        <span className="text-[11px] font-mono text-orange-400/90 font-medium px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
          v2.4
        </span>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Modules
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/25'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Store & System
        </div>

        {/* Customer Store direct link */}
        <button
          onClick={() => {
            if (onSwitchToStore) {
              onSwitchToStore();
            } else {
              window.location.href = '/';
            }
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
            <span>Customer Storefront</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        </button>

        {/* Logout Button */}
        <button
          onClick={onOpenLogout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-red-400/80 group-hover:text-red-400" />
            <span>Logout Session</span>
          </div>
          <span className="text-[10px] font-mono text-red-400/60">Secure</span>
        </button>
      </div>

      {/* User / Super Admin Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-750">
            <div className="w-9 h-9 rounded-lg bg-orange-600 overflow-hidden shrink-0 border border-slate-600">
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user.displayName || 'Admin'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{user.displayName || 'Operations Lead'}</p>
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user.email || 'Admin'}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Sliding panel */}
          <div className="relative z-10 max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
