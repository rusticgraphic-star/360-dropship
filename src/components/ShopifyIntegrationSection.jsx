import React from 'react';
import { ShoppingBag, RefreshCw, CheckCircle, Zap, ArrowRight, Store, Database, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export default function ShopifyIntegrationSection({ onOpenAuth }) {
  return (
    <section id="shopify-sync" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <ShoppingBag className="w-4 h-4 text-blue-600" /> Seamless E-Commerce Engine
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 font-heading leading-tight">
              1-Click <span className="text-blue-600">Shopify Store Sync</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Push products directly to your Shopify store with custom profit markups. When customers place orders on your store, orders instantly trigger automated dispatch at our warehouse!
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold shrink-0 border border-blue-200">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base font-heading">Push Products with Custom Margin</h4>
                  <p className="text-sm text-slate-600">Set your custom selling price and push products directly into your Shopify catalog.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold shrink-0 border border-blue-200">2</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base font-heading">Automated Order Auto-Routing</h4>
                  <p className="text-sm text-slate-600">Customer places order on Shopify &rarr; Order auto-routes to 360 Dropship fulfillment backend.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold shrink-0 border border-blue-200">3</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base font-heading">Automated AWB Tracking Sync</h4>
                  <p className="text-sm text-slate-600">Logistics tracking ID is automatically updated on your customer's Shopify store order page.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="btn-primary text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30"
            >
              Connect Shopify Store Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Visual Architecture Card */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base font-heading">Shopify Integration Flow</h3>
                  <p className="text-xs text-slate-500">Automated Order & Catalog Sync</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                1-CLICK SYNC
              </span>
            </div>

            {/* Sync Diagram */}
            <div className="space-y-3">
              
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold">🛒</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Your Shopify Storefront</h5>
                    <p className="text-[11px] text-slate-500">Customer places prepaid or COD order</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">LIVE</span>
              </div>

              <div className="flex justify-center text-blue-600">
                <ArrowRightLeft className="w-5 h-5 rotate-90" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold">⚡</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">360 Dropship Order Engine</h5>
                    <p className="text-[11px] text-slate-500">Auto order verification & AWB generation</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">AUTOMATED</span>
              </div>

              <div className="flex justify-center text-blue-600">
                <ArrowRightLeft className="w-5 h-5 rotate-90" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 font-bold">📦</div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Warehouse Dispatch & Tracking</h5>
                    <p className="text-[11px] text-slate-500">Flat ₹75 shipping, live tracking updated to Shopify</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">DISPATCHED</span>
              </div>

            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 font-medium">
              ⚡ Instant order sync. Cleared net profit credited directly to your payout ledger.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
