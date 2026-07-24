import React from 'react';
import { Wallet, Landmark, ArrowUpRight, CheckCircle2, TrendingUp, ShieldCheck, FileText, AlertCircle } from 'lucide-react';

export default function PayoutsView({ user, orders = [] }) {
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const netEarnings = deliveredOrders.reduce((sum, o) => sum + (o.netProfit || 0), 0);
  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + (o.sellingPrice || 0), 0);

  const isKycVerified = user?.kycStatus === 'VERIFIED';
  const payoutDestination = isKycVerified
    ? (user?.upiId || user?.email || 'Verified HDFC Bank / UPI Account')
    : 'Not Linked Yet (Complete KYC to Link)';

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated Profit Ledger</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          My Earnings & Profit Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          View your cleared net profit margins and automated bank/UPI payout settlement history.
        </p>
      </div>

      {/* Top Financial Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Net Cleared Earnings</span>
          <p className="text-3xl font-black text-slate-900 font-heading">
            ₹{netEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {deliveredOrders.length > 0 ? 'All payouts auto-settled' : 'Ready for first payout'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gross Sales Revenue</span>
          <p className="text-3xl font-black text-blue-600 font-heading">
            ₹{grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 font-medium">From {deliveredOrders.length} delivered store orders</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Linked Auto-Payout Destination</span>
          <div className="flex items-center gap-2 pt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isKycVerified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-extrabold text-slate-900 text-sm font-mono truncate">
              {payoutDestination}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isKycVerified ? 'Auto-credited upon order delivery' : 'Complete KYC in settings to link bank/UPI'}
          </p>
        </div>

      </div>

      {/* Financial Breakdown Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base font-heading">Profit & Service Fee Ledger</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-500 block mb-1">Customer Selling Price</span>
            <span className="font-extrabold text-slate-900 text-base">100% Gross</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">360 Wholesale + Shipping</span>
            <span className="font-bold text-rose-600 text-base">Cost Deducted</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">5% Agency Service Fee</span>
            <span className="font-bold text-blue-600 text-base">Delivered Only</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Net Dropshipper Earnings</span>
            <span className="font-black text-cyan-600 text-base">100% Payout</span>
          </div>
        </div>
      </div>

      {/* Settled Payouts Table or Blank State */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base font-heading">Auto-Settled Profit Transfers</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            AUTO-CREDITED
          </span>
        </div>

        {deliveredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3.5">Settlement ID</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Delivered Orders</th>
                  <th className="p-3.5">Net Profit Amount</th>
                  <th className="p-3.5">Payout Mode</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deliveredOrders.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">SETTLE-{9900 + idx}</td>
                    <td className="p-3.5 text-slate-700">{item.date || 'Today'}</td>
                    <td className="p-3.5 text-slate-900 font-bold">1 Order</td>
                    <td className="p-3.5 font-black text-emerald-600 text-sm">₹{item.netProfit?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">{payoutDestination}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Settled & Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Landmark className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 font-heading">No Settled Profit Transfers Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When your store receives customer orders and items are delivered, your profit margins will be automatically credited here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
