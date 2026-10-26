import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Bike,
  Flame,
  AlertCircle,
  Eye,
  Printer,
  UserCheck,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Utensils,
  Copy,
  Home,
  Building2
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';
import { Order, OrderStatus } from '../../../types';

interface LiveOrdersModuleProps {
  initialStatusFilter?: OrderStatus | 'all';
}

export const LiveOrdersModule: React.FC<LiveOrdersModuleProps> = ({
  initialStatusFilter = 'all',
}) => {
  const {
    orders,
    riders,
    updateOrderStatus,
    assignRider,
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    searchQuery,
  } = useAdminData();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatusFilter);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedRiderForDispatch, setSelectedRiderForDispatch] = useState<string>('');
  const [kotModalOrder, setKotModalOrder] = useState<Order | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  // Sync initialStatusFilter when changed from KPI cards
  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      cooking: orders.filter(o => o.status === 'cooking').length,
      out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Branch filter
      if (branchFilter !== 'all' && order.branch !== branchFilter) return false;

      // Search query (order id, customer, phone, item name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCustomer = order.customerName.toLowerCase().includes(query);
        const matchesPhone = order.customerPhone.toLowerCase().includes(query);
        const matchesItem = order.items.some(i => i.name.toLowerCase().includes(query));
        const matchesAddress = order.address.toLowerCase().includes(query);
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesItem && !matchesAddress) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, branchFilter, searchQuery]);

  // Unique branches for filter dropdown
  const branchOptions = useMemo(() => {
    const set = new Set(orders.map(o => o.branch));
    return Array.from(set);
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            New Order
          </span>
        );
      case 'cooking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <Flame className="w-3.5 h-3.5 text-orange-600 animate-bounce" />
            Kitchen Prep
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Bike className="w-3.5 h-3.5 text-sky-600" />
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        );
    }
  };

  const handleNextStage = (order: Order) => {
    if (order.status === 'new') {
      updateOrderStatus(order.id, 'cooking');
    } else if (order.status === 'cooking') {
      // Find an available rider or first rider
      const availableRider = riders.find(r => r.status === 'available') || riders[0];
      if (availableRider) {
        assignRider(order.id, availableRider.id);
      } else {
        updateOrderStatus(order.id, 'out_for_delivery');
      }
    } else if (order.status === 'out_for_delivery') {
      updateOrderStatus(order.id, 'delivered');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Live Order Management
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOrders.length} orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept incoming orders, assign cloud kitchen prep, and dispatch delivery partners.
          </p>
        </div>

        {/* Branch Filter dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Kitchen Node:
          </label>
          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Kitchen Nodes ({orders.length})</option>
            {branchOptions.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Segmented Status Tabs */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          All Orders ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'new'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>New</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.new}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('cooking')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'cooking'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200'
          }`}
        >
          <span>Cooking / Kitchen</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.cooking}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('out_for_delivery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'out_for_delivery'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200'
          }`}
        >
          <span>Out for Delivery</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.out_for_delivery}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('delivered')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <span>Delivered</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.delivered}
          </span>
        </button>
      </div>

      {/* Orders Table & Cards */}
      <div className="overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No orders match this filter</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try switching status tabs or clear the search query.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID & Time</th>
                <th className="py-3 px-4">Customer & Address</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4 text-right">Stage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className="hover:bg-orange-50/20 transition-colors group"
                >
                  {/* Order ID & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap align-top">
                    <div className="font-mono font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {order.id}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{order.createdAt}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.branch}
                    </div>
                  </td>

                  {/* Customer & Address */}
                  <td className="py-3.5 px-4 align-top max-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{order.customerName}</span>
                      {order.deliveryAddress?.type && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {order.deliveryAddress.type === 'Home' ? '🏠' : order.deliveryAddress.type === 'Work' ? '💼' : '📍'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={order.deliveryAddress?.formattedAddress || order.address}>
                      <MapPin className="w-2.5 h-2.5 text-orange-500 inline mr-1" />
                      {order.deliveryAddress?.formattedAddress || order.address}
                    </div>
                  </td>

                  {/* Items Summary */}
                  <td className="py-3.5 px-4 align-top max-w-[220px]">
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-medium text-slate-800 truncate">
                            <span className="font-bold text-orange-600 mr-1">{it.quantity}x</span>
                            {it.name}
                          </span>
                          <span className="text-slate-400 font-mono shrink-0">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.specialInstructions && (
                      <div className="mt-1.5 p-1 rounded bg-amber-50/80 border border-amber-200/60 text-[10px] text-amber-800 italic line-clamp-1">
                        Note: {order.specialInstructions}
                      </div>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono text-sm">
                      ₹{order.total}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.paymentMethod}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 rounded mt-0.5 ${
                        order.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'COD'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {getStatusBadge(order.status)}
                    <div className="text-[10px] text-slate-400 mt-1">
                      Prep: ~{order.prepTimeMinutes}m
                    </div>
                  </td>

                  {/* Assigned Partner */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {order.assignedRider ? (
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-orange-500" />
                          <span>{order.assignedRider.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {order.assignedRider.bikeNumber}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Not assigned yet
                      </div>
                    )}
                  </td>

                  {/* Stage Actions */}
                  <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleNextStage(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Accept & Cook</span>
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-all border border-red-200 cursor-pointer"
                            title="Reject / Cancel"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'cooking' && (
                        <button
                          onClick={() => handleNextStage(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Dispatch Rider</span>
                        </button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleNextStage(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}

                      {/* Ticket / Details button */}
                      <button
                        onClick={() => setSelectedOrderForDetail(order)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View Full Ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* KOT (Kitchen Order Ticket) */}
                      <button
                        onClick={() => setKotModalOrder(order)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Print KOT"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* KOT Modal */}
      {kotModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center">
              <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900">
                FOODINSIDE KITCHEN TICKET (KOT)
              </h3>
              <p className="text-xs text-slate-500">{kotModalOrder.branch}</p>
              <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
                <span>{kotModalOrder.id}</span>
                <span>{kotModalOrder.createdAt}</span>
              </div>
            </div>

            <div className="py-4 space-y-2 border-b-2 border-dashed border-slate-300">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Items to Prepare</div>
              {kotModalOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="text-xs text-slate-500 font-mono">[{it.category}]</span>
                </div>
              ))}
              {kotModalOrder.specialInstructions && (
                <div className="p-2 rounded bg-amber-50 text-xs text-amber-900 font-medium">
                  Chef Note: {kotModalOrder.specialInstructions}
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setKotModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.log('Printing KOT...', e);
                  }
                  setKotModalOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal / Drawer */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-orange-600">
                  {selectedOrderForDetail.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Order Details & Dispatch
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Customer & Structured Delivery Address info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedOrderForDetail.customerName}
                    </span>
                    {selectedOrderForDetail.deliveryAddress?.type && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedOrderForDetail.deliveryAddress.type === 'Home'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedOrderForDetail.deliveryAddress.type === 'Work'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {selectedOrderForDetail.deliveryAddress.type === 'Home' ? '🏠 Home' : selectedOrderForDetail.deliveryAddress.type === 'Work' ? '💼 Work' : '📍 Other'}
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${selectedOrderForDetail.deliveryAddress?.contactPhone || selectedOrderForDetail.customerPhone}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrderForDetail.deliveryAddress?.contactPhone || selectedOrderForDetail.customerPhone}</span>
                  </a>
                </div>

                {/* Structured Address Container */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span>Delivery Address (Stored in Firestore)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const fullAddr =
                          selectedOrderForDetail.deliveryAddress?.formattedAddress ||
                          selectedOrderForDetail.address;
                        navigator.clipboard?.writeText(fullAddr);
                        setAddressCopied(true);
                        setTimeout(() => setAddressCopied(false), 2000);
                      }}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{addressCopied ? 'Copied!' : 'Copy Address'}</span>
                    </button>
                  </div>

                  {selectedOrderForDetail.deliveryAddress ? (
                    <div className="space-y-0.5 text-slate-800">
                      <div className="font-bold text-slate-900 text-xs">
                        {selectedOrderForDetail.deliveryAddress.flatNo}, {selectedOrderForDetail.deliveryAddress.street}
                      </div>
                      {selectedOrderForDetail.deliveryAddress.landmark && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Landmark: {selectedOrderForDetail.deliveryAddress.landmark}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-600 font-medium">
                        {selectedOrderForDetail.deliveryAddress.area}, {selectedOrderForDetail.deliveryAddress.city} - {selectedOrderForDetail.deliveryAddress.pincode}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                        Recipient: {selectedOrderForDetail.customerName} ({selectedOrderForDetail.deliveryAddress.contactPhone})
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-700 font-medium text-xs">{selectedOrderForDetail.address}</div>
                  )}
                </div>

                {/* Rider delivery instructions note */}
                {(selectedOrderForDetail.deliveryAddress?.riderInstructions || selectedOrderForDetail.specialInstructions) && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <span className="font-bold shrink-0 bg-amber-200/60 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-amber-900">
                      Rider Note
                    </span>
                    <span className="leading-tight">
                      {selectedOrderForDetail.deliveryAddress?.riderInstructions || selectedOrderForDetail.specialInstructions}
                    </span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Dispatch Hub: {selectedOrderForDetail.branch}</span>
                  <span>Payment: {selectedOrderForDetail.paymentMethod} ({selectedOrderForDetail.isPaid ? 'PAID' : 'COD'})</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Items Ordered</div>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 p-2 text-xs">
                  {selectedOrderForDetail.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="font-medium text-slate-800">
                        {it.quantity}x {it.name}
                      </span>
                      <span className="font-mono text-slate-700">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span className="font-mono text-sm text-orange-600">
                      ₹{selectedOrderForDetail.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rider Assignment section */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Assign Delivery Partner
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {riders.map(r => (
                    <div
                      key={r.id}
                      onClick={() => assignRider(selectedOrderForDetail.id, r.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedOrderForDetail.assignedRider?.id === r.id
                          ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{r.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {r.bikeNumber} · {r.currentLocation}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          r.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrderForDetail.id, 'cancelled');
                    setSelectedOrderForDetail(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => {
                    handleNextStage(selectedOrderForDetail);
                    setSelectedOrderForDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
                >
                  Update Next Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
