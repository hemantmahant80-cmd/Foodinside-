import React from 'react';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Flame,
  Bike,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { OrderStatus } from '../../types';

interface SummaryKpiCardsProps {
  onFilterStatus?: (status: OrderStatus | 'all') => void;
  activeFilter?: OrderStatus | 'all';
}

export const SummaryKpiCards: React.FC<SummaryKpiCardsProps> = ({
  onFilterStatus,
  activeFilter,
}) => {
  const { metrics, setActiveTab } = useAdminData();

  const handleCardClick = (status?: OrderStatus | 'all') => {
    if (status && onFilterStatus) {
      onFilterStatus(status);
    }
  };

  const cards = [
    {
      id: 'total_orders',
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString('en-IN'),
      subtitle: '+14.2% vs yesterday',
      trend: 'positive',
      icon: ShoppingBag,
      color: 'orange',
      bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
      borderColor: 'border-orange-200/80 hover:border-orange-400',
      iconBg: 'bg-orange-500 text-white',
      clickable: true,
      onClick: () => {
        setActiveTab('live_orders');
        handleCardClick('all');
      },
    },
    {
      id: 'total_revenue',
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      subtitle: '+18.5% this week',
      trend: 'positive',
      icon: IndianRupee,
      color: 'slate',
      bgGradient: 'from-slate-900/5 via-slate-900/2 to-transparent',
      borderColor: 'border-slate-200 hover:border-slate-400',
      iconBg: 'bg-[#0f172a] text-white',
      clickable: true,
      onClick: () => {
        setActiveTab('analytics');
      },
    },
    {
      id: 'new_orders',
      title: 'New Orders',
      value: metrics.newOrders,
      subtitle: metrics.newOrders > 0 ? 'Requires kitchen acceptance' : 'All orders accepted',
      trend: metrics.newOrders > 0 ? 'alert' : 'neutral',
      icon: Clock,
      color: 'amber',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: activeFilter === 'new' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-200/80 hover:border-amber-400',
      iconBg: 'bg-amber-500 text-white',
      clickable: true,
      badge: metrics.newOrders > 0 ? 'Live' : undefined,
      onClick: () => {
        setActiveTab('live_orders');
        handleCardClick('new');
      },
    },
    {
      id: 'cooking_orders',
      title: 'Cooking / Kitchen',
      value: metrics.cookingOrders,
      subtitle: 'Avg prep time ~14 mins',
      trend: 'neutral',
      icon: Flame,
      color: 'orange',
      bgGradient: 'from-orange-600/10 via-orange-600/5 to-transparent',
      borderColor: activeFilter === 'cooking' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-200/80 hover:border-orange-400',
      iconBg: 'bg-orange-600 text-white',
      clickable: true,
      onClick: () => {
        setActiveTab('live_orders');
        handleCardClick('cooking');
      },
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      value: metrics.outForDeliveryOrders,
      subtitle: 'Avg delivery ~22 mins',
      trend: 'neutral',
      icon: Bike,
      color: 'blue',
      bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      borderColor: activeFilter === 'out_for_delivery' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-sky-200/80 hover:border-sky-400',
      iconBg: 'bg-sky-600 text-white',
      clickable: true,
      onClick: () => {
        setActiveTab('live_orders');
        handleCardClick('out_for_delivery');
      },
    },
    {
      id: 'delivered',
      title: 'Delivered',
      value: metrics.deliveredOrders.toLocaleString('en-IN'),
      subtitle: '99.1% SLA fulfillment',
      trend: 'positive',
      icon: CheckCircle2,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: activeFilter === 'delivered' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-200/80 hover:border-emerald-400',
      iconBg: 'bg-emerald-600 text-white',
      clickable: true,
      onClick: () => {
        setActiveTab('live_orders');
        handleCardClick('delivered');
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 lg:gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`group relative p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between`}
          >
            {/* Subtle background glow */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.bgGradient} rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-60`}
            />

            {/* Top row: Title and Icon */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle row: Large value */}
            <div className="my-1">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-1.5">
                <span>{card.value}</span>
                {card.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom row: Subtitle / trend indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="truncate">{card.subtitle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
