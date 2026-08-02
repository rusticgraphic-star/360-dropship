import React from 'react';
import { 
  Home, ShoppingBag, ShoppingCart, TrendingUp, Wallet, Settings, 
  Store, HelpCircle, UserCheck, ShieldCheck, Zap, LogOut, ShieldAlert,
  FileSpreadsheet, PlusCircle, Landmark, BarChart3, X, CheckSquare, PackageCheck, Users
} from 'lucide-react';

const DROPSHIPPER_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Home', icon: Home, badge: null },
  { id: 'all-products', label: 'All Products', icon: ShoppingBag, badge: '10K+' },
  { id: 'my-products', label: 'My Products', icon: PackageCheck, badge: 'STORE' },
  { id: 'manage-orders', label: 'My Orders & Tracking', icon: ShoppingCart, badge: null },
  { id: 'meta-ads', label: 'Meta Ads Manager', icon: TrendingUp, badge: 'AGENCY' },
  { id: 'payouts', label: 'My Earnings', icon: Wallet, badge: null },
  { id: 'shopify-manager', label: 'Shopify Store Sync', icon: Store, badge: null },
  { id: 'onboarding', label: 'KYC & Seller Profile', icon: UserCheck, badge: null },
  { id: 'raise-ticket', label: 'Support & Tickets', icon: HelpCircle, badge: null }
];

const ADMIN_MENU_ITEMS = [
  { id: 'dropshipper-management', label: 'All Dropshippers', icon: Users, badge: 'VERIFY' },
  { id: 'payout-approvals', label: 'Payout Release Desk', icon: Landmark, badge: 'PAYOUTS' },
  { id: 'admin-products', label: 'Add & Edit Products', icon: PlusCircle, badge: 'CATALOG' },
  { id: 'agency-settings', label: 'Agency UPI & Settings', icon: Settings, badge: 'UPI' },
  { id: 'platform-analytics', label: 'Platform Analytics', icon: BarChart3, badge: null }
];

export default function Sidebar({ 
  user,
  activeTab, 
  onSelectTab, 
  onOpenSourcingModal, 
  onLogout, 
  userRole, 
  onToggleRole,
  isMobileOpen,
  onCloseMobile
}) {
  const handleItemClick = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const getInitials = () => {
    if (userRole === 'admin') return 'AD';
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.slice(0, 2).toUpperCase();
    }
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'DS';
  };

  const displayName = userRole === 'admin' 
    ? 'Agency Admin' 
    : (user?.name || (user?.email ? user.email.split('@')[0] : 'Dropshipper Seller'));

  const userSubtext = userRole === 'admin'
    ? 'Super Admin'
    : (user?.email || `ID: ${user?.id || 'USR-1001'}`);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden" 
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 
        flex flex-col justify-between text-slate-900 shrink-0 shadow-xl lg:shadow-sm transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top Section: Brand & Navigation */}
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.png" alt="360 Dropship" className="h-10 w-auto object-contain" />
            </div>
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Source Product Button (For Dropshippers) */}
          {userRole !== 'admin' && (
            <div className="p-4">
              <button
                onClick={() => { onOpenSourcingModal(); if (onCloseMobile) onCloseMobile(); }}
                className="w-full btn-primary text-xs font-bold py-2.5 px-3 rounded-xl justify-center shadow-md shadow-blue-600/30"
              >
                + Source Custom Product
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar mt-2">
            {userRole === 'admin' ? (
              ADMIN_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (activeTab === 'admin-portal' && item.id === 'payout-approvals');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              DROPSHIPPER_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (activeTab === 'manage-products' && item.id === 'all-products');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </nav>
        </div>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-slate-200 bg-white">

          {/* User Card */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 truncate font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">{userSubtext}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
