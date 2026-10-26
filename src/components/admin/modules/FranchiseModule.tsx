import React from 'react';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';

export const FranchiseModule: React.FC = () => {
  const { franchises } = useAdminData();

  const totalFranchiseMonthly = franchises.reduce((sum, f) => sum + f.monthRevenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Franchise & Branch Management
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {franchises.length} Outlets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Network revenue distribution, territory compliance audits, and branch fulfillment SLAs.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Monthly Network Gross:</span>
          <div className="text-lg font-bold font-mono text-slate-900">
            ₹{(totalFranchiseMonthly / 100000).toFixed(2)} Lakhs
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {franchises.map(f => (
          <div
            key={f.id}
            className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-white hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {f.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{f.franchiseName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{f.address}</span>
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    f.complianceStatus === 'Active & Verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {f.complianceStatus}
                </span>
              </div>

              {/* Revenue Strip */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Today's Sales</span>
                  <div className="font-mono font-bold text-slate-900">
                    ₹{f.dailyRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Monthly Run-Rate</span>
                  <div className="font-mono font-bold text-slate-900">
                    ₹{(f.monthRevenue / 100000).toFixed(1)}L
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">SLA Fulfillment</span>
                  <div className="font-mono font-bold text-emerald-600">
                    {f.fulfillmentRate}%
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Owner: <strong className="text-slate-800">{f.ownerName}</strong></span>
              <span className="text-[11px] text-slate-400">{f.contact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
