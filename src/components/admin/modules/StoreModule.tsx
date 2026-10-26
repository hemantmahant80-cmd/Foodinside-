import React, { useState } from 'react';
import {
  Store,
  ExternalLink,
  CheckCircle2,
  Settings,
  Flame,
  Clock,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';

export const StoreModule: React.FC = () => {
  const { menuItems, orders } = useAdminData();
  const [storeOpen, setStoreOpen] = useState(true);
  const [minOrder, setMinOrder] = useState(50);
  const [deliveryCharge, setDeliveryCharge] = useState(20);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(299);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSaveSettings = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Storefront Portal
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                storeOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {storeOpen ? 'Store Accepting Orders' : 'Store Offline'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure consumer web experience, operating hours, delivery thresholds, and preview storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <span>Launch Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Settings Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-600" />
            <span>Storefront Operational Rules</span>
          </h3>

          {/* Intake Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Accept Online Orders</div>
              <div className="text-[11px] text-slate-500">Enable customers to place new food orders</div>
            </div>
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                storeOpen ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  storeOpen ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Delivery Pricing */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={e => setDeliveryCharge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={e => setMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Free Delivery Above Threshold (₹)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Save Store Rules
            </button>
            {savedAlert && (
              <p className="text-[11px] text-emerald-600 font-semibold text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings updated successfully
              </p>
            )}
          </div>
        </div>

        {/* Live Store Preview Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-600" />
                <span>Storefront Customer Experience</span>
              </h3>
              <span className="text-[11px] text-slate-500">Live preview below</span>
            </div>

            {/* Embedded interactive storefront viewport */}
            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-50">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-300 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    https://foodinside.app/
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
              </div>

              <div className="p-4 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                      FI
                    </div>
                    <span className="font-bold text-slate-900 text-sm">foodinside</span>
                  </div>
                  <span className="text-xs text-orange-600 font-semibold">
                    {menuItems.filter(i => i.inStock).length} Dishes Ready To Order
                  </span>
                </div>

                {/* Actual FoodInside Storefront Visual Snapshot */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm max-h-56">
                  <img
                    src="/assets/aistudio/f9ae3874-8ed5-4db3-a1fa-6b331be29df7_a72be12d.jpeg"
                    alt="FoodInside Storefront"
                    className="w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs text-white font-bold">
                      Customer App Live View • Indiranagar Hub
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {menuItems.slice(0, 4).map(it => (
                    <div key={it.id} className="p-2 rounded-lg border border-slate-200">
                      <div className="font-bold truncate text-slate-800">{it.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">₹{it.price}</div>
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          it.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {it.inStock ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Synced with Cloud Kitchens & Real-time Dispatch
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Open Customer Store in New Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
