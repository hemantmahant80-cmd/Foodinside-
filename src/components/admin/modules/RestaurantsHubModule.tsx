import React from 'react';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';

export const RestaurantsHubModule: React.FC = () => {
  const { hubs, toggleHubStatus } = useAdminData();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Cloud Kitchens & Restaurant Hubs
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {hubs.length} Hubs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time kitchen station capacities, order loads, and pause intake during extreme surges.
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {hubs.map(hub => {
          const isHighLoad = hub.capacityPercent >= 80;
          return (
            <div
              key={hub.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all bg-white hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 uppercase tracking-wide">
                      {hub.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{hub.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hub.address}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleHubStatus(hub.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      hub.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : hub.status === 'busy'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hub.status === 'online'
                          ? 'bg-emerald-500'
                          : hub.status === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="capitalize">{hub.status}</span>
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      Station Capacity Load
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isHighLoad ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {hub.capacityPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isHighLoad ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${hub.capacityPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{hub.activeOrders} orders cooking</span>
                    <span>Avg prep: {hub.avgPrepTime}m</span>
                  </div>
                </div>
              </div>

              {/* Hub Contact and rating footer */}
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  <span className="font-medium text-slate-800">{hub.manager}</span>
                  <span className="text-[11px] text-slate-400 ml-1">({hub.phone})</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-800 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200/60">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{hub.rating}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
