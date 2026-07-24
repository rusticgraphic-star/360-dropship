import React, { useState } from 'react';
import { 
  BarChart3, Zap, Wallet, Play, Pause, AlertTriangle, ShieldCheck, 
  TrendingUp, ArrowUpRight, Plus, RefreshCw, FileText, CheckCircle2 
} from 'lucide-react';

export default function MetaAdsManagerView({ campaigns, walletBalance, onOpenRechargeModal, onToggleCampaignStatus }) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const totalSpent = campaigns.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const isBalanceZero = walletBalance <= 0;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
              AGENCY MANAGED
            </span>
            <span className="text-xs text-slate-500 font-medium">Free Meta Agency Account Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
            Meta Ads Agency Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Our agency runs dedicated Facebook & Instagram campaigns for your products under your unique seller tag.
          </p>
        </div>

        <button
          onClick={onOpenRechargeModal}
          className="btn-primary text-xs font-bold py-3 px-5 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" /> Add Ad Budget (+18% GST)
        </button>
      </div>

      {/* Safeguard Alert Banner */}
      {isBalanceZero && campaigns.length > 0 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0 border border-rose-200">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-rose-900 text-sm font-heading">
                🚨 AUTO-PAUSE SAFEGUARD TRIGGERED: Ads Wallet Balance = ₹0
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Your Meta Ad Campaigns have been automatically paused via Free Meta Agency Account to prevent overspending. Recharge min ₹1,000 to instantly resume ads!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRechargeModal}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-md shrink-0"
          >
            Recharge Now via Instant UPI →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 flex items-center justify-between text-xs font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Free Meta Agency Account Safeguard Armed:</strong> Wallet balance: <strong className="text-blue-600 font-bold">₹{walletBalance.toLocaleString('en-IN')}</strong>. Ready to launch campaigns.
            </span>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ● AGENCY ACCOUNT CONNECTED
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Ad Spend</span>
          <p className="text-2xl font-black text-slate-900 font-heading">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Across 2 Active Meta Campaigns</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Generated Purchases</span>
          <p className="text-2xl font-black text-cyan-600 font-heading">{totalConversions} Conversions</p>
          <p className="text-[11px] text-cyan-600 font-bold mt-1">Average ROAS: 3.95x</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Available Ad Wallet</span>
          <p className="text-2xl font-black text-slate-900 font-heading">₹{walletBalance.toLocaleString('en-IN')}</p>
          <button
            onClick={onOpenRechargeModal}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold mt-1 inline-block underline"
          >
            + Top Up Wallet via Instant UPI
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base font-heading">Live Meta Ad Campaigns</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            AGENCY TAGGED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Daily Budget</th>
                <th className="p-3.5">Spent</th>
                <th className="p-3.5">Conversions</th>
                <th className="p-3.5">ROAS</th>
                <th className="p-3.5">Cost/Purchase</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-slate-900 max-w-xs truncate">{camp.name}</td>
                  <td className="p-3.5 text-slate-700">₹{camp.dailyBudget}/day</td>
                  <td className="p-3.5 text-slate-700">₹{camp.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-extrabold text-cyan-600">{camp.conversions} Sales</td>
                  <td className="p-3.5 font-black text-emerald-600">{camp.roas}</td>
                  <td className="p-3.5 text-slate-700">₹{camp.costPerPurchase.toFixed(2)}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onToggleCampaignStatus(camp.id)}
                      className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg"
                    >
                      {camp.status === 'ACTIVE' ? <><Pause className="w-3.5 h-3.5 inline mr-1 text-rose-600" /> Pause</> : <><Play className="w-3.5 h-3.5 inline mr-1 text-emerald-600" /> Resume</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
