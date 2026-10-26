import React from 'react';
import {
  Clock,
  BarChart3,
  PackageCheck,
  UtensilsCrossed,
  Building2,
  Bike,
  Store,
  LogOut,
  ChevronRight,
  Sparkles,
  Bot,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { AdminModuleTab } from '../../types';

interface QuickNavCardsProps {
  onOpenLogout: () => void;
}

export const QuickNavCards: React.FC<QuickNavCardsProps> = ({ onOpenLogout }) => {
  const { activeTab, setActiveTab, metrics, menuItems, hubs, franchises, riders } = useAdminData();

  const outOfStockCount = menuItems.filter(i => !i.inStock).length;
  const inStockCount = menuItems.filter(i => i.inStock).length;
  const activeHubsCount = hubs.filter(h => h.status !== 'offline').length;
  const onlineRidersCount = riders.filter(r => r.status !== 'offline').length;

  const navCards = [
    {
      id: 'live_orders' as AdminModuleTab,
      title: 'Live Orders',
      description: 'Real-time kitchen prep, dispatch & delivery stages',
      icon: Clock,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100/90 group-hover:bg-orange-500 group-hover:text-white',
      badge: `${metrics.newOrders} New · ${metrics.cookingOrders} In Kitchen`,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      metric: `${ordersCountLabel(metrics.newOrders, metrics.cookingOrders)}`,
    },
    {
      id: 'analytics' as AdminModuleTab,
      title: 'Analytics',
      description: 'Sales trends, peak hourly volume & bestsellers',
      icon: BarChart3,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100/90 group-hover:bg-blue-600 group-hover:text-white',
      badge: '+18.5% This Week',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      metric: '₹1.84L Gross',
    },
    {
      id: 'menu_stock' as AdminModuleTab,
      title: 'Menu Stock (In/Out)',
      description: 'Toggle instant item availability & kitchen stock counts',
      icon: PackageCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100/90 group-hover:bg-emerald-600 group-hover:text-white',
      badge: `${inStockCount} In · ${outOfStockCount} Out`,
      badgeColor: outOfStockCount > 0 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      metric: `${Math.round((inStockCount / menuItems.length) * 100)}% Stocked`,
    },
    {
      id: 'restaurants_hub' as AdminModuleTab,
      title: 'Restaurants Hub',
      description: 'Cloud kitchen branches, intake capacity & ratings',
      icon: UtensilsCrossed,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100/90 group-hover:bg-purple-600 group-hover:text-white',
      badge: `${activeHubsCount} Hubs Operational`,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      metric: '4.8★ Avg Rating',
    },
    {
      id: 'franchise_branches' as AdminModuleTab,
      title: 'Franchise & Branches',
      description: 'Franchise network, city territory & revenue share',
      icon: Building2,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100/90 group-hover:bg-indigo-600 group-hover:text-white',
      badge: `${franchises.length} Franchise Outlets`,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      metric: '98.8% SLA',
    },
    {
      id: 'rider_app' as AdminModuleTab,
      title: 'Rider App & Fleet',
      description: 'Active courier tracking, bike units & dispatch control',
      icon: Bike,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-100/90 group-hover:bg-cyan-600 group-hover:text-white',
      badge: `${onlineRidersCount} Couriers On Duty`,
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      metric: '22m Avg Delivery',
    },
    {
      id: 'ai_assistant' as AdminModuleTab,
      title: 'Gemini AI Assistant',
      description: 'Multi-turn Ops advisor with Google Search & Maps Grounding',
      icon: Bot,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100/90 group-hover:bg-orange-600 group-hover:text-white',
      badge: 'Argon + Flash + Lite',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      metric: 'Search & Maps Live',
    },
    {
      id: 'video_studio' as AdminModuleTab,
      title: 'Cinematic Video Studio',
      description: 'Animate high-res dish photos into MP4 video with Gemini Omni Flash',
      icon: Video,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100/90 group-hover:bg-purple-600 group-hover:text-white',
      badge: 'Interactions API',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      metric: '16:9 & 9:16 Video',
    },
    {
      id: 'image_studio' as AdminModuleTab,
      title: 'Food Image Studio',
      description: 'Create & edit culinary dishes using text prompts with Nano Banana',
      icon: ImageIcon,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100/90 group-hover:bg-emerald-600 group-hover:text-white',
      badge: 'Nano Banana 2.1',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      metric: '1K / 2K High Res',
    },
    {
      id: 'store' as AdminModuleTab,
      title: 'Storefront Portal',
      description: 'Customer storefront controls, menu sync & live preview',
      icon: Store,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100/90 group-hover:bg-amber-600 group-hover:text-white',
      badge: 'Open for Orders',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      metric: 'Web & Mobile',
    },
    {
      id: 'logout' as AdminModuleTab,
      title: 'Logout Session',
      description: 'Securely sign out of the FoodInside Admin console',
      icon: LogOut,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100/90 group-hover:bg-red-600 group-hover:text-white',
      badge: 'Super Admin',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      metric: 'Session Secure',
      isLogout: true,
    },
  ];

  function ordersCountLabel(newOrders: number, cooking: number) {
    if (newOrders > 0) return `${newOrders} Action Required`;
    if (cooking > 0) return `${cooking} Cooking`;
    return 'All Dispatched';
  }

  const handleCardClick = (id: AdminModuleTab, isLogout?: boolean) => {
    if (isLogout) {
      onOpenLogout();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Operations & Management Modules
          </h2>
          <p className="text-xs text-slate-500">
            Select a module to manage live orders, stock, kitchen nodes, riders, or view store
          </p>
        </div>
        {activeTab !== 'overview' && (
          <button
            onClick={() => setActiveTab('overview')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
          >
            <span>Back to Full Overview</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {navCards.map(card => {
          const Icon = card.icon;
          const isActive = activeTab === card.id;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id, card.isLogout)}
              className={`group relative text-left p-4 rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isActive
                  ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md bg-gradient-to-b from-orange-50/20 to-white'
                  : 'border-slate-200/90 hover:border-orange-300'
              }`}
            >
              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
              )}

              {/* Top: Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor} shrink-0`}
                >
                  {card.badge}
                </span>
              </div>

              {/* Middle: Title & Description */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-bold tracking-tight transition-colors ${
                      isActive ? 'text-orange-600' : 'text-slate-900 group-hover:text-orange-600'
                    }`}
                  >
                    {card.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom: Metric & Arrow */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 tabular-nums">
                  {card.metric}
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                    isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-600'
                  }`}
                >
                  <span>{isActive ? 'Active' : 'Open'}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
