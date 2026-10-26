import React, { useState } from 'react';
import {
  Bike,
  Phone,
  Battery,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  Star,
  Activity,
  Send
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';

export const RiderAppModule: React.FC = () => {
  const { riders, orders, assignRider } = useAdminData();
  const [selectedRiderId, setSelectedRiderId] = useState<string>(riders[0]?.id || '');

  const selectedRider = riders.find(r => r.id === selectedRiderId) || riders[0];
  const pendingOrders = orders.filter(o => o.status === 'cooking' || o.status === 'new');

  return (
    <div className="space-y-5">
      {/* Rider Fleet Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Rider Dispatch & Fleet Telemetry
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              {riders.length} Active Couriers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor live bike locations, battery levels, and route orders directly to closest couriers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GPS & Telemetry Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Rider Fleet Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {riders.map(r => {
              const isSelected = r.id === selectedRiderId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRiderId(r.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-gradient-to-b from-cyan-50/20 to-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top row: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {r.bikeNumber}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          r.status === 'delivering'
                            ? 'bg-sky-100 text-sky-800'
                            : r.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    {/* Location & Battery */}
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span className="truncate">{r.currentLocation}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 text-emerald-600" />
                          {r.batteryLevel}% Battery
                        </span>
                        <span>{r.completedToday} Delivered Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Current Order / Rating */}
                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                    {r.currentOrderId ? (
                      <span className="font-semibold text-orange-600 font-mono">
                        Order {r.currentOrderId}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dispatch
                      </span>
                    )}

                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {r.rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Rider Telemetry & Dispatch Box */}
        {selectedRider && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src={selectedRider.avatar}
                  alt={selectedRider.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedRider.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedRider.bikeNumber}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedRider.phone}</span>
                  </p>
                </div>
              </div>

              {/* Simulated Map View */}
              <div className="my-4 relative h-40 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* SVG Route lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40">
                  <path
                    d="M 20 120 Q 80 40, 160 80 T 260 40"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />
                </svg>

                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Live GPS Track: 12.9716° N, 77.5946° E
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-300 mt-1">
                    {selectedRider.speedKmH > 0 ? `${selectedRider.speedKmH} km/h` : 'Stationed'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                  {selectedRider.currentLocation}
                </div>
              </div>

              {/* Assign to waiting order */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Assign to Incoming Order
                </div>
                {pendingOrders.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No waiting orders need dispatch right now.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {pendingOrders.map(ord => (
                      <div
                        key={ord.id}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold font-mono text-slate-900">{ord.id}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            {ord.customerName} (₹{ord.total})
                          </span>
                        </div>
                        <button
                          onClick={() => assignRider(ord.id, selectedRider.id)}
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400 text-center">
              Rider telematics refreshed in real-time
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
