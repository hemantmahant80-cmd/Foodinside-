import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { SummaryKpiCards } from './SummaryKpiCards';
import { QuickNavCards } from './QuickNavCards';
import { LiveOrdersModule } from './modules/LiveOrdersModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { MenuStockModule } from './modules/MenuStockModule';
import { RestaurantsHubModule } from './modules/RestaurantsHubModule';
import { FranchiseModule } from './modules/FranchiseModule';
import { RiderAppModule } from './modules/RiderAppModule';
import { StoreModule } from './modules/StoreModule';
import { LogoutModal } from './modules/LogoutModal';
import { GeminiChatbot } from '../ai/GeminiChatbot';
import { FoodVideoStudio } from '../ai/FoodVideoStudio';
import { FoodImageStudio } from '../ai/FoodImageStudio';
import { useAdminData } from '../../context/AdminDataContext';
import { OrderStatus } from '../../types';

interface AdminDashboardProps {
  onSwitchToStore?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchToStore }) => {
  const { activeTab, setActiveTab } = useAdminData();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  const handleFilterFromKpi = (status: OrderStatus | 'all') => {
    setOrderStatusFilter(status);
    setActiveTab('live_orders');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex antialiased">
      {/* Dark Premium Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenLogout={() => setLogoutModalOpen(true)}
        onSwitchToStore={onSwitchToStore}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <AdminHeader
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenLogout={() => setLogoutModalOpen(true)}
          onSwitchToStore={onSwitchToStore}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 p-4 lg:p-7 space-y-6 max-w-7xl w-full mx-auto">
          {/* Summary KPI Cards (Visible across overview or accessible) */}
          <SummaryKpiCards
            onFilterStatus={handleFilterFromKpi}
            activeFilter={orderStatusFilter}
          />

          {/* Quick Operations Hub (The 8 modern cards) */}
          <QuickNavCards onOpenLogout={() => setLogoutModalOpen(true)} />

          {/* Active Module View */}
          <div className="pt-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Live Orders Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Recent & Active Kitchen Orders
                      </h3>
                      <p className="text-xs text-slate-500">
                        Live stream of new orders and food in preparation
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('live_orders')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      View All Live Orders →
                    </button>
                  </div>
                  <LiveOrdersModule initialStatusFilter="all" />
                </div>

                {/* Quick Analytics & Rush Hours */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Real-Time Operations Analytics
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hourly sales volume and category revenue share
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      Full Analytics Report →
                    </button>
                  </div>
                  <AnalyticsModule />
                </div>
              </div>
            )}

            {activeTab === 'live_orders' && (
              <LiveOrdersModule initialStatusFilter={orderStatusFilter} />
            )}

            {activeTab === 'analytics' && <AnalyticsModule />}

            {activeTab === 'menu_stock' && <MenuStockModule />}

            {activeTab === 'restaurants_hub' && <RestaurantsHubModule />}

            {activeTab === 'franchise_branches' && <FranchiseModule />}

            {activeTab === 'rider_app' && <RiderAppModule />}

            {activeTab === 'store' && <StoreModule />}

            {activeTab === 'ai_assistant' && <GeminiChatbot />}

            {activeTab === 'video_studio' && <FoodVideoStudio />}

            {activeTab === 'image_studio' && (
              <FoodImageStudio
                onSendToVideoStudio={() => setActiveTab('video_studio')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};
