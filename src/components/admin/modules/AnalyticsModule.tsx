import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  Award,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';

export const AnalyticsModule: React.FC = () => {
  const { metrics, menuItems, orders } = useAdminData();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Hourly order volume data for visual bar chart
  const hourlyData = [
    { hour: '11 AM', orders: 18, revenue: 2400 },
    { hour: '12 PM', orders: 42, revenue: 6200 },
    { hour: '1 PM', orders: 86, revenue: 12800 },
    { hour: '2 PM', orders: 64, revenue: 8900 },
    { hour: '3 PM', orders: 28, revenue: 3800 },
    { hour: '4 PM', orders: 32, revenue: 4200 },
    { hour: '5 PM', orders: 48, revenue: 6500 },
    { hour: '6 PM', orders: 58, revenue: 7900 },
    { hour: '7 PM', orders: 92, revenue: 14200 },
    { hour: '8 PM', orders: 124, revenue: 18900 },
    { hour: '9 PM', orders: 110, revenue: 16400 },
    { hour: '10 PM', orders: 62, revenue: 9100 },
  ];

  const maxOrders = Math.max(...hourlyData.map(h => h.orders));

  // Category sales share
  const categoriesShare = [
    { name: 'Street Snacks (Vada Pav, Chaat, Pakodi)', pct: 38, count: '542 orders', color: 'bg-orange-500' },
    { name: 'Burgers & Wraps', pct: 24, count: '342 orders', color: 'bg-amber-500' },
    { name: 'Artisan Pizza', pct: 18, count: '256 orders', color: 'bg-rose-500' },
    { name: 'South Indian & Bowls', pct: 12, count: '172 orders', color: 'bg-purple-500' },
    { name: 'Cold Beverages & Desserts', pct: 8, count: '116 orders', color: 'bg-sky-500' },
  ];

  // Top selling dishes sorted by units sold
  const topDishes = [...menuItems].sort((a, b) => b.dailySold - a.dailySold).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Analytics Top Control Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sales & Operations Analytics</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Feed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time revenue, rush-hour peak distribution, and product sales insights.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* KPI Overview strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Order Value (AOV)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹142.50</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8.2% vs last month
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Kitchen Prep Time</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">11.8 mins</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Within 15m SLA target
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Delivery Time</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">21.4 mins</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            2.1 mins faster today
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Customer Satisfaction</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">4.88 ★</div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-flex items-center gap-1">
            Based on 984 reviews
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hourly Peak Order Volume
              </h3>
              <p className="text-xs text-slate-500">
                Peak rushes: Lunch (1-2 PM) & Dinner (8-9 PM)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900">
                124 Orders Max Peak
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 justify-between px-2">
              {hourlyData.map((h, i) => {
                const heightPercent = Math.round((h.orders / maxOrders) * 100);
                const isPeak = h.orders >= 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-16 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none z-10 shadow-lg whitespace-nowrap">
                      {h.orders} orders · ₹{h.revenue}
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        isPeak
                          ? 'bg-gradient-to-t from-orange-600 to-orange-400 group-hover:from-orange-500 group-hover:to-orange-300 shadow-sm'
                          : 'bg-slate-200 group-hover:bg-orange-300'
                      }`}
                    />

                    {/* Label */}
                    <span className="text-[10px] text-slate-400 font-mono -rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Sales by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Revenue distribution across core culinary categories
            </p>

            <div className="space-y-3">
              {categoriesShare.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate">{cat.name}</span>
                    <span className="font-mono text-slate-900">{cat.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 flex justify-between">
            <span>Fastest growing: Street Snacks (+28%)</span>
            <span className="text-orange-600 font-semibold">View Detail</span>
          </div>
        </div>
      </div>

      {/* Top Selling Products Leaderboard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Top Selling Dishes & Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-150 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5">Item Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Today's Units Sold</th>
                <th className="py-2.5 text-right">Gross Revenue</th>
                <th className="py-2.5 text-center">Customer Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDishes.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-7 h-7 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3 text-slate-500">{item.category}</td>
                  <td className="py-3 text-right font-mono font-semibold">₹{item.price}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    {item.dailySold} units
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-orange-600">
                    ₹{(item.dailySold * item.price).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px]">
                      ★ {item.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
