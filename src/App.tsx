import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerStore } from './components/customer/CustomerStore';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';

interface AppProps {
  initialAdmin?: boolean;
}

export default function App({ initialAdmin }: AppProps) {
  const [isAdminView, setIsAdminView] = useState(() => {
    if (initialAdmin !== undefined) return initialAdmin;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      return path.includes('admin') || search.includes('admin');
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      setIsAdminView(path.includes('admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSwitchToStore = () => {
    setIsAdminView(false);
    window.history.pushState({}, '', '/');
  };

  const handleSwitchToAdmin = () => {
    setIsAdminView(true);
    window.history.pushState({}, '', '/admin.html');
  };

  return (
    <AuthProvider>
      <AdminDataProvider>
      <div className="relative min-h-screen">
        {/* Floating Quick Role Switcher for Dev / Preview Convenience */}
        <aside
          aria-label="App Mode Switcher"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/90 text-white backdrop-blur-md shadow-2xl border border-slate-700/80 text-xs font-semibold"
        >
          <button
            onClick={handleSwitchToStore}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              !isAdminView
                ? 'bg-orange-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer Store</span>
          </button>

          <button
            onClick={handleSwitchToAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              isAdminView
                ? 'bg-orange-600 text-white shadow-xs font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>
        </aside>

        {/* View Router */}
        {isAdminView ? (
          <AdminDashboard onSwitchToStore={handleSwitchToStore} />
        ) : (
          <CustomerStore onSwitchToAdmin={handleSwitchToAdmin} />
        )}
      </div>
    </AdminDataProvider>
    </AuthProvider>
  );
}
