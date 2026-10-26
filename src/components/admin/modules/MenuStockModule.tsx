import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  PackageX,
  Search,
  Filter,
  Plus,
  Minus,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Percent,
  BadgePercent,
  Flame,
  X,
  Save,
  Eye,
  IndianRupee
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';
import { MenuItem } from '../../../types';

export const MenuStockModule: React.FC = () => {
  const { menuItems, toggleStock, updateStockCount, updateItemPrepTime, updateMenuItemPriceAndOffer } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'on_offer'>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Offer modal edit form state
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editOfferActive, setEditOfferActive] = useState<boolean>(false);
  const [editOfferPrice, setEditOfferPrice] = useState<number>(0);
  const [editDiscountPercentage, setEditDiscountPercentage] = useState<number>(0);
  const [editOfferTag, setEditOfferTag] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const categories = ['all', 'Snacks', 'Burgers', 'Pizza', 'Indian', 'South Indian', 'Beverages', 'Desserts'];

  const openOfferModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditBasePrice(item.price);
    setEditOfferActive(!!item.offerActive);
    const offerPrice = item.offerPrice ?? Math.round(item.price * 0.8);
    setEditOfferPrice(offerPrice);
    const discount = item.discountPercentage ?? Math.round(((item.price - offerPrice) / item.price) * 100);
    setEditDiscountPercentage(discount > 0 ? discount : 20);
    setEditOfferTag(item.offerTag || `${discount > 0 ? discount : 20}% OFF`);
  };

  const closeOfferModal = () => {
    setEditingItem(null);
  };

  const handleBasePriceChange = (newBase: number) => {
    const val = Math.max(1, newBase);
    setEditBasePrice(val);
    if (editDiscountPercentage > 0) {
      const calculatedOffer = Math.max(1, Math.round(val * (1 - editDiscountPercentage / 100)));
      setEditOfferPrice(calculatedOffer);
    }
  };

  const handleOfferPriceChange = (newOffer: number) => {
    const val = Math.max(1, newOffer);
    setEditOfferPrice(val);
    if (editBasePrice > 0) {
      const discount = Math.max(0, Math.round(((editBasePrice - val) / editBasePrice) * 100));
      setEditDiscountPercentage(discount);
    }
  };

  const handleDiscountPercentageChange = (newDiscount: number) => {
    const clamped = Math.min(95, Math.max(1, newDiscount));
    setEditDiscountPercentage(clamped);
    if (editBasePrice > 0) {
      const calculatedOffer = Math.max(1, Math.round(editBasePrice * (1 - clamped / 100)));
      setEditOfferPrice(calculatedOffer);
    }
  };

  const handleApplyPresetDiscount = (percentage: number, defaultTag: string) => {
    handleDiscountPercentageChange(percentage);
    setEditOfferTag(defaultTag);
    setEditOfferActive(true);
  };

  const handleSavePriceAndOffer = () => {
    if (!editingItem) return;

    updateMenuItemPriceAndOffer(editingItem.id, {
      price: editBasePrice,
      offerPrice: editOfferActive ? editOfferPrice : undefined,
      discountPercentage: editOfferActive ? editDiscountPercentage : undefined,
      offerTag: editOfferActive ? editOfferTag.trim() : undefined,
      offerActive: editOfferActive,
    });

    setSaveSuccessNotice(`Price & offer updated for ${editingItem.name}!`);
    setTimeout(() => {
      setSaveSuccessNotice(null);
      closeOfferModal();
    }, 900);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (stockStatusFilter === 'in_stock' && !item.inStock) return false;
      if (stockStatusFilter === 'out_of_stock' && item.inStock) return false;
      if (stockStatusFilter === 'on_offer' && (!item.offerActive || !item.offerPrice)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, stockStatusFilter, search]);

  const inStockTotal = menuItems.filter(i => i.inStock).length;
  const outOfStockTotal = menuItems.filter(i => !i.inStock).length;
  const onOfferTotal = menuItems.filter(i => i.offerActive && i.offerPrice).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner & Control */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Menu Pricing, Stock & Offer Customizer
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              {menuItems.length} Dishes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize dish regular prices, configure promotional discount offers, tags, and manage live inventory stock.
          </p>
        </div>

        {/* Stock & Offer status KPI strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStockStatusFilter('on_offer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              stockStatusFilter === 'on_offer'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>{onOfferTotal} On Special Offer</span>
          </button>

          <button
            onClick={() => setStockStatusFilter('in_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              stockStatusFilter === 'in_stock'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{inStockTotal} In Stock</span>
          </button>

          <button
            onClick={() => setStockStatusFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              stockStatusFilter === 'out_of_stock'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{outOfStockTotal} Out of Stock</span>
          </button>

          {stockStatusFilter !== 'all' && (
            <button
              onClick={() => setStockStatusFilter('all')}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1 font-medium"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Category pills & Search */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category list */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Search inside menu */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dish name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const hasActiveOffer = item.offerActive && item.offerPrice !== undefined;
            const savings = hasActiveOffer ? item.price - item.offerPrice! : 0;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  item.inStock
                    ? 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-md'
                    : 'bg-slate-50/80 border-red-200 opacity-90'
                }`}
              >
                {/* Image & Badges Header */}
                <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      !item.inStock ? 'grayscale contrast-125' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                  {/* Stock Toggle pill at top right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleStock(item.id)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer ${
                        item.inStock
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span>{item.inStock ? 'IN STOCK' : 'OUT'}</span>
                    </button>
                  </div>

                  {/* Category tag & Offer Tag at top left */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {item.category}
                    </span>
                    {hasActiveOffer && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md animate-pulse">
                        <Flame className="w-2.5 h-2.5" />
                        {item.offerTag || `${item.discountPercentage}% OFF`}
                      </span>
                    )}
                  </div>

                  {/* Pricing on image bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-end justify-between">
                    <div>
                      {hasActiveOffer ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-lg font-black text-amber-400">
                            ₹{item.offerPrice}
                          </span>
                          <span className="font-mono text-xs text-slate-300 line-through">
                            ₹{item.price}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold ml-0.5">
                            Save ₹{savings}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-base font-extrabold tracking-tight">
                          ₹{item.price}
                        </span>
                      )}
                      <div className="text-[10px] text-slate-300 font-medium">
                        {item.prepTimeMinutes}m prep • ★ {item.rating}
                      </div>
                    </div>

                    <button
                      onClick={() => openOfferModal(item)}
                      className="px-2 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all hover:scale-105"
                      title="Customize Price & Offer"
                    >
                      <Tag className="w-3 h-3 text-orange-600" />
                      <span>Edit Offer</span>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      {hasActiveOffer ? (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                          {item.discountPercentage}% OFF
                        </span>
                      ) : (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions & Inventory */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Inventory Stock:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStockCount(item.id, -5)}
                          disabled={!item.inStock}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-slate-900 min-w-[28px] text-center">
                          {item.unitsRemaining}
                        </span>
                        <button
                          onClick={() => updateStockCount(item.id, +5)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => openOfferModal(item)}
                        className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-all flex items-center justify-center gap-1"
                      >
                        <BadgePercent className="w-3.5 h-3.5 text-orange-600" />
                        <span>Price & Offer</span>
                      </button>

                      <button
                        onClick={() => toggleStock(item.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                          item.inStock
                            ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {item.inStock ? (
                          <>
                            <PackageX className="w-3.5 h-3.5 text-red-500" />
                            <span>Set Out</span>
                          </>
                        ) : (
                          <>
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price & Offer Customizer Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={editingItem.image}
                  alt={editingItem.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {editingItem.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {editingItem.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {editingItem.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={closeOfferModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-5">
              {/* Regular Price Row */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Regular Base Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={editBasePrice}
                    onChange={e => handleBasePriceChange(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-base font-extrabold text-slate-900 focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 150"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  The standard menu price before any promotional discounts.
                </p>
              </div>

              {/* Offer Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Enable Promotional Offer</div>
                    <div className="text-xs text-slate-600">
                      Display discounted price and promo tag on customer storefront
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editOfferActive}
                    onChange={e => setEditOfferActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Offer Details Panel (Active Only) */}
              {editOfferActive && (
                <div className="space-y-4 p-4 rounded-2xl border border-orange-200 bg-orange-50/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      Offer Price & Discount Calculator
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Customer Saves ₹{Math.max(0, editBasePrice - editOfferPrice)}
                    </span>
                  </div>

                  {/* Dual Inputs: Offer Price & Discount Percentage */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Offer Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={editBasePrice}
                          value={editOfferPrice}
                          onChange={e => handleOfferPriceChange(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Discount (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="95"
                          value={editDiscountPercentage}
                          onChange={e => handleDiscountPercentageChange(Number(e.target.value))}
                          className="w-full pl-3 pr-7 py-2 rounded-xl bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                      Quick Discount Presets:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { pct: 15, tag: '15% OFF' },
                        { pct: 20, tag: '20% OFF' },
                        { pct: 25, tag: '25% OFF' },
                        { pct: 30, tag: '30% OFF' },
                        { pct: 50, tag: 'BOGO 50%' },
                      ].map(preset => (
                        <button
                          key={preset.pct}
                          type="button"
                          onClick={() => handleApplyPresetDiscount(preset.pct, preset.tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            editDiscountPercentage === preset.pct
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
                          }`}
                        >
                          {preset.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo Badge / Tag */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Promotional Tag / Badge Text:
                    </label>
                    <div className="relative">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editOfferTag}
                        onChange={e => setEditOfferTag(e.target.value)}
                        placeholder="e.g. FLAT 25% OFF, CHEF'S SPECIAL, BOGO"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 uppercase"
                      />
                    </div>
                    {/* Quick Tag Suggestion Chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {["CHEF'S PICK", 'HOT DEAL', 'COMBO DEAL', 'LIMITED OFFER'].map(sugg => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => setEditOfferTag(sugg)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          +{sugg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Storefront Live Preview */}
                  <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-xs space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3 text-orange-600" />
                      Live Customer Storefront Preview:
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-orange-600">
                          ₹{editOfferPrice}
                        </span>
                        <span className="font-mono text-xs text-slate-400 line-through">
                          ₹{editBasePrice}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-black">
                          {editOfferTag || `${editDiscountPercentage}% OFF`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">
                        You Save ₹{Math.max(0, editBasePrice - editOfferPrice)}!
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Notice */}
            {saveSuccessNotice && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessNotice}</span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={closeOfferModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePriceAndOffer}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Price & Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
