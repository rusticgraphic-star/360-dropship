import React, { useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Package, Wallet, ShoppingBag, 
  Sparkles, ArrowRight, Zap, CheckCircle2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export default function DashboardHome({ user, orders = [], onSelectTab, onSelectProduct, onOpenRechargeModal, products, walletBalance }) {
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const dropshipperName = user?.name ? user.name.toUpperCase() : 'DROPSHIPPER';

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* 1. TOP PROMOTIONAL DEAL BANNER */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-2xl border border-slate-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950">
        
        {/* Glowing Background Radial */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> WELCOME, {dropshipperName}
            </div>
            
            <p className="text-slate-300 font-semibold text-xs sm:text-sm">
              Featured Trending E-Commerce Catalog
            </p>
            
            <h1 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight leading-tight">
              SMART WEARABLE. <span className="text-cyan-400">UP TO 80% OFF</span>
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Wholesale pricing from ₹450 with 1-Click push to your Shopify store. Flat ₹75 fixed shipping & RTO charge.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onSelectTab('manage-products')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/40 transition-all flex items-center gap-1.5"
              >
                Explore Smartwatches <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectTab('shopify-manager')}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-extrabold py-3.5 px-6 rounded-xl transition-all"
              >
                Push to Shopify
              </button>
            </div>
          </div>

          {/* Product Banner Image */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80"
                alt="Smart Wearable"
                className="w-48 sm:w-56 h-48 sm:h-56 object-cover rounded-3xl shadow-2xl border-2 border-slate-700/80 transform hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-blue-400">
                ₹450 Wholesale
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. TOP CATEGORIES HORIZONTAL SLIDER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-900">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
              Top Categories
            </h2>
            <p className="text-xs text-slate-500 font-medium">Explore Our Diverse Range Of Product Collections.</p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCategories('left')}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Categories Horizontal Track */}
        <div
          ref={categoryScrollRef}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2 px-1"
        >
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onSelectTab('manage-products')}
              className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group w-28 text-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 p-1 group-hover:border-blue-600 group-hover:shadow-md transition-all">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* 3. KEY METRICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">{orders?.length || 0} Orders</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            {orders?.length > 0 ? '↑ 18% from last week' : 'Ready for first order'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered Net Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">
            ₹{(orders?.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.netProfit || 0), 0) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">After 5% Agency fee & ₹75 shipping</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Ads Wallet</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">₹{(walletBalance || 0).toLocaleString('en-IN')}</p>
          <button
            onClick={onOpenRechargeModal}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold mt-1 inline-block underline"
          >
            + Recharge via Instant UPI QR
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta API Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 font-heading flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Auto-Pause Safeguard Armed</p>
        </div>

      </div>

      {/* 4. FEATURED TRENDING PRODUCTS PREVIEW */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-heading">High-Margin Trending Products</h3>
            <p className="text-xs text-slate-500">Includes 360 Dropship Cost breakdown</p>
          </div>
          <button
            onClick={() => onSelectTab('manage-products')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Catalog →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {products && products.length > 0 && products.slice(0, 4).map((product) => {
            const wholesaleCost = parseFloat(product.wholesalePrice || 350);
            const shipping = parseFloat(product.shippingFee || 75);
            const mrp = parseFloat(product.suggestedMrp || 1299);
            const baseCost = wholesaleCost + shipping;
            const estMargin = Math.max(0, mrp - baseCost - (mrp * 0.05));

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-500 transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectProduct ? onSelectProduct(product) : onSelectTab('manage-products')}
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between">
                        <span>360 Dropship Cost:</span>
                        <span className="font-bold text-blue-600">₹{baseCost}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 text-emerald-600 font-extrabold">
                        <span>Est. Profit Margin:</span>
                        <span>₹{estMargin.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onSelectTab('shopify-manager')}
                    className="w-full btn-primary text-xs justify-center py-2.5 font-bold shadow-xs"
                  >
                    Push to Shopify
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
