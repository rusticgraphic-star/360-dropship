import React from 'react';
import { Flame, Lock, MessageSquare, Sparkles, ShoppingBag, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function WinningProductsView({ user, products = [], onPushToShopify, onSelectProduct }) {
  const currentUser = user || dbService.getCurrentUser();
  const adminSettings = dbService.getAdminSettings ? dbService.getAdminSettings() : { whatsappNumber: '+919876543210' };
  const cleanWaNumber = (adminSettings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  const hasAccess = currentUser?.email?.toLowerCase() === 'rustic241@gmail.com' ||
    dbService.hasWinningAccess(currentUser?.id) ||
    dbService.hasWinningAccess(currentUser?.email);

  // Filter top rated products with high margins as winning products
  const winningProducts = products.filter(p => p.rating >= 4.7 || p.wholesalePrice < 400).slice(0, 30);

  // LOCKED VIEW (If Admin has NOT granted access)
  if (!hasAccess) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
              PREMIUM ACCESS ONLY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
            🔥 High-ROAS Winning Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Exclusive access to pre-tested, high-converting winning products verified by 360 Agency Ads Desk.
          </p>
        </div>

        {/* LOCKED CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 rounded-3xl text-white shadow-2xl text-center space-y-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
              🔒 ACCESS NOT ACTIVATED BY ADMIN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
              Winning Products Catalog Locked
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1">
              Admin has not granted Winning Products access to your account yet. To unlock our agency's pre-tested <strong>3.5x+ ROAS winning products catalog</strong>, please contact Admin on WhatsApp!
            </p>
          </div>

          <div className="pt-4 max-w-md mx-auto">
            <a
              href={`https://wa.me/${cleanWaNumber}?text=Hello%20Admin,%20please%20activate%20Winning%20Products%20Access%20for%20my%20account%20(${encodeURIComponent(currentUser?.email || '')})`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 text-slate-950" />
              <span>Contact Admin on WhatsApp to Unlock Access →</span>
            </a>
            <p className="text-[11px] text-slate-400 mt-3 font-medium">Instant 1-on-1 Admin Approval on WhatsApp</p>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW (If Admin has granted access)
  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
              ● ACCESS UNLOCKED 🟢
            </span>
            <span className="text-xs text-slate-500 font-medium">Pre-Tested High ROAS Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
            🔥 Exclusive Winning Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Handpicked pre-tested winning items with guaranteed high conversion rates and 3.5x+ ROAS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {winningProducts.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="relative aspect-square overflow-hidden bg-slate-50">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-3 left-3 bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" /> WINNING PRODUCT
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">{p.category}</span>
                <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 mt-0.5 group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Wholesale Price</span>
                  <span className="text-lg font-black text-slate-900">₹{p.wholesalePrice}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Suggested Price</span>
                  <span className="text-sm font-bold text-emerald-600">₹{p.suggestedMrp}</span>
                </div>
              </div>

              <button
                onClick={() => onPushToShopify ? onPushToShopify(p) : (onSelectProduct && onSelectProduct(p))}
                className="w-full btn-primary text-xs font-extrabold py-3 rounded-xl justify-center gap-2 mt-2 shadow-md shadow-blue-600/20"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> Push to Shopify Store
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
