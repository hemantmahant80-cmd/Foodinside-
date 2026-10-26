import React, { useState } from 'react';
import {
  Flame,
  Search,
  ShoppingCart,
  User,
  Heart,
  Plus,
  Minus,
  Trash2,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Headphones,
  Truck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Bot,
  Sparkles,
  X,
  LogIn,
  LogOut,
  Smartphone
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { GeminiChatbot } from '../ai/GeminiChatbot';
import { CustomerLoginModal } from './CustomerLoginModal';
import { MenuItem, Order } from '../../types';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CustomerStoreProps {
  onSwitchToAdmin?: () => void;
}

export const CustomerStore: React.FC<CustomerStoreProps> = ({ onSwitchToAdmin }) => {
  const { menuItems, addNewOrder, orders } = useAdminData();
  const { user, signInWithGoogle, signInAsAdmin, signInAsCustomer, logOut } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([
    {
      item: menuItems.find(m => m.name === 'Vada Pav') || menuItems[0],
      quantity: 1,
    },
    {
      item: menuItems.find(m => m.name === 'Spicy Samosa Chaat') || menuItems[1],
      quantity: 1,
    },
  ]);
  const [orderPlacedNotice, setOrderPlacedNotice] = useState<string | null>(null);

  const categories = [
    { name: 'Burgers', icon: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80' },
    { name: 'Pizza', icon: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80' },
    { name: 'Snacks', icon: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=150&auto=format&fit=crop&q=80' },
    { name: 'Indian', icon: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=150&auto=format&fit=crop&q=80' },
    { name: 'Chinese', icon: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop&q=80' },
    { name: 'South Indian', icon: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80' },
    { name: 'Beverages', icon: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=150&auto=format&fit=crop&q=80' },
    { name: 'Desserts', icon: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80' },
  ];

  const popularItems = menuItems.filter(i => i.isPopular);

  const addToCart = (item: MenuItem) => {
    if (!item.inStock) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => (ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(ci => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const deliveryCharge = cart.length > 0 ? 20 : 0;
  const total = subtotal + deliveryCharge;
  const cartItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `#FI${randomNum}`;

    const newOrd: Order = {
      id: orderId,
      customerName: 'Aman Verma',
      customerPhone: '+91 98200 44312',
      address: address || 'Flat 402, Sunshine Residency, HAL 2nd Stage, Indiranagar',
      branch: 'Indiranagar Central Hub',
      items: cart.map(ci => ({
        id: ci.item.id,
        name: ci.item.name,
        quantity: ci.quantity,
        price: ci.item.price,
        category: ci.item.category,
      })),
      subtotal,
      deliveryCharge,
      tax: 0,
      total,
      status: 'new',
      createdAt: 'Just now',
      prepTimeMinutes: 12,
      elapsedMinutes: 0,
      paymentMethod: 'UPI / Online',
      isPaid: true,
      specialInstructions: 'Ring doorbell twice, please keep chutneys separate.',
    };

    addNewOrder(newOrd);
    setCart([]);
    setOrderPlacedNotice(orderId);
    setTimeout(() => setOrderPlacedNotice(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Notice: Quick link to Admin Panel */}
      <div className="bg-slate-950 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">
            FoodInside Multi-Role System: Customer Storefront & Operations Console
          </span>
        </div>
        <button
          onClick={() => {
            if (onSwitchToAdmin) {
              onSwitchToAdmin();
            } else {
              window.location.href = '/admin.html';
            }
          }}
          className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Admin Operations Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Navbar */}
      <header className="bg-black text-white px-4 lg:px-12 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">
            <Flame className="w-5 h-5 fill-white" />
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <a href="#home" className="text-orange-500 hover:text-orange-400">Home</a>
          <a href="#menu" className="hover:text-white transition-colors">Menu</a>
          <a href="#kitchen" className="hover:text-white transition-colors">Cloud Kitchen</a>
          <a href="#track" className="hover:text-white transition-colors">Track Order</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </nav>

        {/* Right Search, Cart & Login */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* AI Culinary Assistant Modal Trigger */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white shadow-xs cursor-pointer"
            title="Ask Gemini Culinary AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI ✦</span>
          </button>

          {/* Cart Icon */}
          <div className="relative p-2 rounded-lg text-slate-200 hover:text-white">
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>

          {/* User Auth (Google Sign-In with Firebase) */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-orange-500 shrink-0">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline truncate max-w-[90px]">
                {user.displayName ? user.displayName.split(' ')[0] : 'Member'}
              </span>
              <button
                onClick={logOut}
                className="text-[11px] text-slate-400 hover:text-red-400 font-semibold cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white shadow-xs cursor-pointer transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Customer OTP Login</span>
              </button>
              <button
                onClick={signInWithGoogle}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                title="Google Sign In"
              >
                <LogIn className="w-3 h-3 text-orange-400" />
                <span>Google</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden py-10 lg:py-16 px-4 lg:px-12">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&auto=format&fit=crop&q=80"
            alt="Delicious burger and fries hero"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Fresh</span>
            <span>•</span>
            <span>Tasty</span>
            <span>•</span>
            <span>Fast</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3">
            Your Favorite Food <br />
            Now at Your <span className="text-orange-500">Doorstep</span>
          </h1>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Order from your favorite restaurants, track your order in real-time and enjoy delicious food at home.
          </p>

          {/* Search bar inside hero */}
          <div className="flex items-center bg-white rounded-full p-1.5 max-w-md shadow-2xl">
            <MapPin className="w-4 h-4 text-orange-600 ml-3 shrink-0" />
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your delivery address..."
              className="flex-1 px-3 py-2 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
            />
            <button className="px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-1">
              <span>Find Food</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content & Cart Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {orderPlacedNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-between shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Order placed successfully! Order ID: {orderPlacedNotice}. Check Live Orders in Admin Panel!</span>
            </div>
            <button
              onClick={() => {
                if (onSwitchToAdmin) {
                  onSwitchToAdmin();
                } else {
                  window.location.href = '/admin.html';
                }
              }}
              className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-extrabold cursor-pointer"
            >
              View in Admin →
            </button>
          </div>
        )}

        {/* Categories Strip */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-4 scrollbar-none">
            {categories.map(cat => (
              <div
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? 'All' : cat.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border cursor-pointer transition-all min-w-[100px] shadow-xs hover:shadow-md ${
                  activeCategory === cat.name ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-orange-200'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200">
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 text-center">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Split: Menu Grid (Left 2/3) + Cart / Tracking (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Popular Items */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Popular Items
              </h2>
              <p className="text-xs text-slate-500">
                Freshly prepared • Highly rated • Loved by you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularItems
                .filter(i => (activeCategory === 'All' ? true : i.category === activeCategory))
                .map(item => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    {/* Item Image */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white hover:text-red-500 backdrop-blur-xs transition-colors"
                        aria-label="Add to favorites"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Body */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-bold text-base font-mono text-slate-900">
                          ₹ {item.price}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                            item.inStock
                              ? 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Your Cart + Track Your Order */}
          <div className="space-y-6">
            {/* Your Cart Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
                <span>Your Cart</span>
              </h3>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Your cart is empty. Add items from the menu.
                </div>
              ) : (
                <div className="py-3 divide-y divide-slate-100 space-y-3">
                  {cart.map(ci => (
                    <div key={ci.item.id} className="pt-2 flex items-center justify-between gap-2">
                      <img
                        src={ci.item.image}
                        alt={ci.item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {ci.item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(ci.item.id, -1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold">{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(ci.item.id, +1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          ₹ {ci.item.price * ci.quantity}
                        </div>
                        <button
                          onClick={() => removeFromCart(ci.item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bill Summary */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹ {subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-bold text-slate-900">₹ {deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="font-mono text-orange-600">₹ {total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="mt-4 w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Track Your Order Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Track Your Order</h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Order ID: #FI123456
                </span>
              </div>

              {/* Stepper */}
              <div className="space-y-3 pl-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="font-bold text-slate-900">Order Placed</span>
                    <span className="text-slate-400 font-mono">09:15 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="font-bold text-slate-900">Preparing Your Food</span>
                    <span className="text-slate-400 font-mono">09:25 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] animate-pulse">
                    ✓
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="font-bold text-slate-900">Out for Delivery</span>
                    <span className="text-slate-400 font-mono">09:45 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                    ○
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="font-medium text-slate-600">Delivered</span>
                    <span className="text-slate-400 font-mono">Estimated ~10m</span>
                  </div>
                </div>
              </div>

              {/* Rider card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Rohit Kumar"
                    className="w-10 h-10 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Rohit Kumar</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Bike No. CG 10 AB 1234
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+919845211092"
                    className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                    title="Call Rider"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800"
                    title="Chat with Rider"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Fast Delivery</div>
              <div className="text-[11px] text-slate-500">Hot & fresh at your door</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Live Tracking</div>
              <div className="text-[11px] text-slate-500">Track your order in real-time</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Secure Payment</div>
              <div className="text-[11px] text-slate-500">100% safe & reliable</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">24/7 Support</div>
              <div className="text-[11px] text-slate-500">We are always here</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white px-4 lg:px-12 py-10 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center text-lg font-bold">
                <span className="text-white">food</span>
                <span className="text-orange-500">inside</span>
              </div>
              <p className="text-[10px] text-slate-400">Good Food • Better Mood</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="#menu" className="hover:text-white">Menu</a>
            <a href="#kitchen" className="hover:text-white">Cloud Kitchen</a>
            <a href="#track" className="hover:text-white">Track Order</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 foodinside. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Customer AI Assistant Button */}
      <aside aria-label="Customer AI Assistant trigger" className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-orange-400/30"
        >
          <Sparkles className="w-4 h-4 fill-white animate-pulse" />
          <span>Ask Gemini AI ✦</span>
        </button>
      </aside>

      {/* Gemini AI Assistant Modal Dialog */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>FoodInside Culinary & Assistant AI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Argon • Flash • Lite
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Real-time dish advice, order tracking, recipes & store locations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chatbot Content Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <GeminiChatbot />
            </div>
          </div>
        </div>
      )}

      {/* Real-Time OTP Customer Login Modal */}
      <CustomerLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};
