import React from 'react';
import { Search, Bell, Wallet, Plus, Store, CheckCircle, Menu } from 'lucide-react';

export default function Header({ walletBalance, onOpenRechargeModal, onSelectTab, onToggleMobileSidebar }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-slate-900 shadow-xs">
      
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Mobile Logo */}
        <div className="flex items-center lg:hidden">
          <img src="/logo.png" alt="360 Dropship" className="h-8 w-auto object-contain" />
        </div>

        {/* Search Input */}
        <div className="relative w-72 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 10,000+ products..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Shopify Status Pill */}
        <div
          onClick={() => onSelectTab('shopify-manager')}
          className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Shopify Sync Active</span>
        </div>

        {/* Ads Wallet Balance Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 sm:pr-3 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-500 font-bold block uppercase leading-none">Meta Ads Wallet</span>
            <span className="text-xs font-black text-slate-900 font-heading">₹{(walletBalance || 0).toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={onOpenRechargeModal}
            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            title="Recharge Ads Balance"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifications */}
        <button className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
        </button>

      </div>

    </header>
  );
}
