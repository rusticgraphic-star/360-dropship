import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Zap, Sparkles, TrendingUp, RefreshCw, ShoppingBag, Globe, Mail } from 'lucide-react';

const RECENT_DISPATCHES = [
  { item: "Smart Watch Ultra 2", city: "Jaipur, RJ", profit: "₹650" },
  { item: "Brass Ganesha Idol", city: "Surat, GJ", profit: "₹520" },
  { item: "4K Action Camera", city: "Bangalore, KA", profit: "₹1,840" },
  { item: "Ceramic Pan Set", city: "Lucknow, UP", profit: "₹890" },
  { item: "Portable Juicer Blender", city: "Chandigarh", profit: "₹580" }
];

export default function Hero({ onOpenAuth }) {
  const [emailInput, setEmailInput] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_DISPATCHES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentDispatch = RECENT_DISPATCHES[tickerIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    onOpenAuth('signup');
  };

  return (
    <section className="relative overflow-hidden bg-slate-50 text-slate-900 pt-10 pb-24 border-b border-slate-200">
      
      {/* Royal Blue & Cyan Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-r from-blue-400/20 via-cyan-400/10 to-indigo-400/15 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LIVE DISPATCH TICKER BAR */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-md px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md">
            <span className="flex items-center gap-1 text-blue-700 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              LIVE DISPATCH
            </span>
            <span className="text-slate-700 transition-all duration-300">
              <strong>{currentDispatch.item}</strong> dispatched to {currentDispatch.city} • <span className="text-emerald-600 font-bold">Dropshipper Profit {currentDispatch.profit}</span>
            </span>
          </div>
        </div>

        {/* HERO MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Headline & Signup */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> India's #1 Automated Dropship Network
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] font-heading text-slate-900">
              Scale Your Brand With <br />
              <span className="text-blue-600">₹0 Inventory Risk</span> & 1-Click Sync
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Instant access to <strong>10,000+ wholesale-priced products</strong>. Flat ₹75 shipping & <strong>ZERO RTO Fees</strong>, agency-run Meta Ads engine, and direct bank payouts.
            </p>

            {/* Quick Email Signup Form */}
            <div className="max-w-md mx-auto lg:mx-0 pt-2">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xl">
                <div className="flex items-center gap-2 px-3.5 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 flex-1">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="Enter Your Email Address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full text-slate-900 font-semibold placeholder-slate-400 focus:outline-none text-xs sm:text-sm bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary text-sm whitespace-nowrap justify-center py-3.5 px-6 rounded-xl font-extrabold shadow-lg shadow-blue-600/30"
                >
                  Start Store Free <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-xs text-slate-500 mt-3 font-medium flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Email & Mobile Password Login. Zero upfront deposit.
              </p>
            </div>

          </div>

          {/* Right Column: Dynamic Interactive Live Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                    360
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">Automated Order Engine</h3>
                    <p className="text-xs text-slate-500">Live Profit Calculation</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full uppercase">
                  ● ACTIVE SYNC
                </span>
              </div>

              {/* Sample Product Live Margin Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=120&auto=format&fit=crop&q=80"
                    alt="Smartwatch"
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">TRENDING ELECTRONICS</span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">Smart Watch Ultra 2 AMOLED</h4>
                    <p className="text-[11px] text-slate-500">360 Dropship Cost: ₹525 (Product + Shipping)</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between">
                    <span>Shopify Selling Price:</span>
                    <span className="font-bold text-slate-900">₹1,499</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>- 360 Dropship Cost:</span>
                    <span className="font-semibold">-₹525</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>- 5% Agency Ad Fee:</span>
                    <span className="font-semibold">-₹75</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-600 font-extrabold text-sm">
                    <span>= Your Net Profit / Order:</span>
                    <span>₹899.00</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full btn-primary justify-center py-3 text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Push This Item to Your Store →
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* PILLARS GRID BELOW HERO */}
        <div id="features" className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-16 mt-16 border-t border-slate-200">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
            <div className="text-blue-600 font-extrabold text-xl mb-1 font-heading">10,000+</div>
            <p className="text-xs font-bold text-slate-900">Wholesale Products</p>
            <p className="text-[11px] text-slate-500 mt-0.5">High-demand trending catalog</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
            <div className="text-cyan-600 font-extrabold text-xl mb-1 font-heading">₹75 Flat</div>
            <p className="text-xs font-bold text-slate-900">Fixed Shipping & RTO</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No hidden courier penalties</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
            <div className="text-blue-600 font-extrabold text-xl mb-1 font-heading">Ad Agency</div>
            <p className="text-xs font-bold text-slate-900">Ads Engine</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Meta Ads Agency</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
            <div className="text-purple-600 font-extrabold text-xl mb-1 font-heading">5% Fee</div>
            <p className="text-xs font-bold text-slate-900">Delivered Orders Only</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Zero charge on returned items</p>
          </div>

        </div>

      </div>
    </section>
  );
}
