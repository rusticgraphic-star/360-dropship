import React from 'react';
import { 
  Megaphone, ShieldCheck, Zap, Truck, CreditCard, Headphones, 
  Sparkles, CheckCircle2, TrendingUp, RefreshCw, Store, Check, ArrowRight,
  Gift, Layers, Target, Shield, Percent, Video, PlayCircle
} from 'lucide-react';

export default function ServicesFeaturesSection({ onOpenAuth }) {
  
  const servicePillars = [
    {
      id: 'ads-agency',
      pillarBadge: '🎯 META ADS AGENCY & FREE ACCOUNTS',
      pillarTitle: 'Free Meta Agency Ad Accounts & 1-on-1 Ads Support',
      pillarSubtitle: 'Never worry about ad account bans or restrictions. We provide high-trust Meta agency ad accounts with expert performance marketing guidance.',
      borderColor: 'border-blue-200 hover:border-blue-500',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white',
      features: [
        {
          icon: Gift,
          title: 'FREE Agency Ad Accounts',
          desc: 'High-trust Meta & Facebook agency ad accounts with zero ban risk and unlimited daily spending capacity.'
        },
        {
          icon: Target,
          title: '1-on-1 Performance Marketing Support',
          desc: 'Dedicated Meta Ads experts guide your campaign setup, audience targeting, ROAS optimization, and scaling.'
        },
        {
          icon: Video,
          title: 'Winning Ad Creatives & Video Assets',
          desc: 'Get ready-to-use high-converting ad videos, ad copy, and thumb-stopping visual assets for every trending product.'
        },
        {
          icon: TrendingUp,
          title: 'Instant UPI Ad Wallet Recharge',
          desc: 'Recharge your ad budget via instant UPI QR with automated safeguards to prevent overspending.'
        }
      ]
    },
    {
      id: 'catalog-logistics',
      pillarBadge: '📦 CATALOG & PAN-INDIA LOGISTICS',
      pillarTitle: '9,000+ Winning Catalog & Express 2-4 Days Shipping',
      pillarSubtitle: 'Source pre-tested winning products at rock-bottom wholesale prices and deliver nationwide with same-day dispatch.',
      borderColor: 'border-emerald-200 hover:border-emerald-500',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white',
      features: [
        {
          icon: Store,
          title: '9,000+ Pre-Tested Winning Catalog',
          desc: 'Pre-verified trending products across Home, Electronics, Beauty & Kitchenware with guaranteed 60%+ profit margins.'
        },
        {
          icon: Truck,
          title: 'Same-Day Dispatch & 2-4 Days Delivery',
          desc: 'Orders dispatched within 12 hours with express Pan-India delivery via Delhivery, BlueDart & Xpressbees.'
        },
        {
          icon: Shield,
          title: 'Automated COD Verification Engine',
          desc: 'Automated WhatsApp & IVR customer confirmation before dispatch reduces Return-To-Origin (RTO) below 8%.'
        },
        {
          icon: Layers,
          title: '1-Click Shopify & Store Sync',
          desc: 'Push products, live inventory counts, selling prices, and automated order fulfillment to your store in just 1 click.'
        }
      ]
    },
    {
      id: 'payouts-management',
      pillarBadge: '💰 FINANCIAL GUARANTEES & SUPPORT',
      pillarTitle: 'Weekly Direct Profit Payouts & Dedicated Support Manager',
      pillarSubtitle: 'Run a stress-free business with automated weekly direct transfers to your bank account and personal account manager support.',
      borderColor: 'border-purple-200 hover:border-purple-500',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200 group-hover:bg-purple-600 group-hover:text-white',
      features: [
        {
          icon: CreditCard,
          title: 'Direct Weekly Profit Transfers',
          desc: 'Net profits are calculated automatically and transferred directly to your Bank Account or UPI ID every week.'
        },
        {
          icon: Percent,
          title: 'Zero Hidden Fees & 0% Advance',
          desc: 'No upfront inventory costs, zero subscription fees, and no surprise deductions. Pay wholesale cost only when an order is placed.'
        },
        {
          icon: Headphones,
          title: 'Dedicated Personal Account Manager',
          desc: 'Personal account manager available for 1-on-1 WhatsApp & Call support for product sourcing and store growth.'
        },
        {
          icon: ShieldCheck,
          title: 'Transit Damage & Claims Protection',
          desc: 'Hassle-free claims process protecting your business against transit damages or missing packages.'
        }
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-50 text-slate-900 relative overflow-hidden border-b border-slate-200">
      
      {/* Background Subtle Gradient Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-blue-400/10 via-cyan-400/10 to-indigo-400/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" /> Complete Dropshipping Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight text-slate-900">
            Complete Dropshipping Services & <span className="text-blue-600">Free Meta Ads Agency Support</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            From pre-tested winning catalogs and same-day Pan-India shipping to automated COD verification and <strong className="text-slate-900 font-bold">FREE Meta Agency Ad Accounts with 1-on-1 performance marketing support</strong> — everything powered under one unified platform.
          </p>
        </div>

        {/* 3 OPEN SERVICE PILLARS (NO HIDDEN TABS OR DROPDOWNS) */}
        <div className="space-y-12">
          {servicePillars.map((pillar) => (
            <div 
              key={pillar.id}
              className={`bg-white border ${pillar.borderColor} rounded-3xl p-6 sm:p-10 shadow-lg transition-all space-y-8`}
            >
              {/* PILLAR HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2 border ${pillar.badgeStyle}`}>
                    {pillar.pillarBadge}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-900">
                    {pillar.pillarTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
                    {pillar.pillarSubtitle}
                  </p>
                </div>

                <button
                  onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
                  className="btn-primary text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-md shadow-blue-600/30 flex items-center gap-2 shrink-0 self-start sm:self-auto group"
                >
                  <span>Start Free Access</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* PILLAR 4-CARD FEATURE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pillar.features.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-slate-50/80 border border-slate-200 p-6 rounded-2xl hover:border-blue-500 hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center group-hover:scale-110 transition-all shadow-xs`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base font-heading">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-200 flex items-center text-[11px] text-blue-600 font-extrabold gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Included Free</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM QUICK BENEFIT SUMMARY STRIP */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center space-y-1">
            <span className="text-2xl">🎁</span>
            <h5 className="font-extrabold text-xs text-slate-900">Free Ad Accounts</h5>
            <p className="text-[10px] text-slate-500 font-medium">Zero Ban Risk</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl">🎯</span>
            <h5 className="font-extrabold text-xs text-slate-900">1-on-1 Ads Support</h5>
            <p className="text-[10px] text-slate-500 font-medium">ROAS Scaling</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl">🎬</span>
            <h5 className="font-extrabold text-xs text-slate-900">Video Creatives</h5>
            <p className="text-[10px] text-slate-500 font-medium">Ready Ad Copy</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl">📦</span>
            <h5 className="font-extrabold text-xs text-slate-900">9,000+ Products</h5>
            <p className="text-[10px] text-slate-500 font-medium">Verified Catalog</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl">🚚</span>
            <h5 className="font-extrabold text-xs text-slate-900">2-4 Days Shipping</h5>
            <p className="text-[10px] text-slate-500 font-medium">Same-Day Dispatch</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl">💳</span>
            <h5 className="font-extrabold text-xs text-slate-900">Weekly Payouts</h5>
            <p className="text-[10px] text-slate-500 font-medium">Direct Bank Transfer</p>
          </div>
        </div>

      </div>
    </section>
  );
}
