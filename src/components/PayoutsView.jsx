import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, ArrowUpRight, CheckCircle2, TrendingUp, ShieldCheck, FileText, AlertCircle, Plus, RefreshCw, X } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function PayoutsView({ user, orders = [] }) {
  const currentUser = user || dbService.getCurrentUser();
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const netEarnings = deliveredOrders.reduce((sum, o) => sum + (o.netProfit || 0), 0);
  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + (o.sellingPrice || 0), 0);

  const isKycVerified = currentUser?.kycStatus === 'VERIFIED';
  const payoutDestination = isKycVerified
    ? (currentUser?.upiId || currentUser?.email || 'Verified HDFC Bank / UPI Account')
    : 'Not Linked Yet (Complete KYC to Link)';

  // Real Payout Requests State
  const [userPayoutRequests, setUserPayoutRequests] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestUpi, setRequestUpi] = useState('');
  const [bankDetailsInput, setBankDetailsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const refreshUserPayouts = () => {
    if (dbService.getPayoutRequests) {
      const all = dbService.getPayoutRequests();
      const myRequests = all.filter(r => r.userId === currentUser?.id || r.userEmail === currentUser?.email);
      setUserPayoutRequests(myRequests);
    }
  };

  useEffect(() => {
    refreshUserPayouts();
  }, [currentUser?.id]);

  const handleCreatePayoutRequest = (e) => {
    e.preventDefault();
    const amt = Number(requestAmount);
    if (!amt || amt < 500) {
      alert('Minimum payout withdrawal amount is ₹500.');
      return;
    }

    setIsSubmitting(true);
    if (dbService.submitPayoutRequest) {
      dbService.submitPayoutRequest({
        userId: currentUser?.id || 'USR-1001',
        userName: currentUser?.name || currentUser?.email || 'Dropshipper',
        userEmail: currentUser?.email || '',
        amount: amt,
        upiId: requestUpi.trim() || currentUser?.email || 'upi@bank',
        bankDetails: bankDetailsInput.trim() || 'HDFC Bank, Acc: XXXX1234'
      });
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    refreshUserPayouts();

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsRequestModalOpen(false);
      setRequestAmount('');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated Profit Ledger</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
            My Earnings & Payout Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Request profit withdrawal payouts and track bank/UPI settlement verification status.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="btn-primary text-xs font-extrabold py-3 px-5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <Landmark className="w-4 h-4 text-emerald-300" /> Request Payout Withdrawal
        </button>
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
            {deliveredOrders.length > 0 ? 'Net profit cleared' : 'Ready for first payout'}
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
            {isKycVerified ? 'Auto-credited upon Admin approval' : 'Complete KYC in settings to link bank/UPI'}
          </p>
        </div>

      </div>

      {/* Real Payout Withdrawal Requests Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base font-heading">Your Payout Withdrawal Requests</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            ADMIN VERIFICATION REQUIRED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3.5">Request ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Requested Amount</th>
                <th className="p-3.5">UPI ID / Bank Details</th>
                <th className="p-3.5">Bank UTR Ref</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {userPayoutRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    No payout withdrawal requests submitted yet. Click "Request Payout Withdrawal" to submit your request to Admin.
                  </td>
                </tr>
              ) : (
                userPayoutRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{req.id}</td>
                    <td className="p-3.5 text-slate-600">{req.createdAt ? req.createdAt.split('T')[0] : 'Today'}</td>
                    <td className="p-3.5 font-black text-emerald-600 text-sm">₹{req.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-slate-800 font-mono">{req.upiId || req.bankDetails}</td>
                    <td className="p-3.5 font-mono text-blue-600 font-bold">{req.utrNumber || 'Pending Verification'}</td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'APPROVED' ? '● APPROVED & PAID' : req.status === 'REJECTED' ? '❌ REJECTED' : '⏳ PENDING APPROVAL'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST PAYOUT WITHDRAWAL MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/30">
                  PROFIT WITHDRAWAL REQUEST
                </span>
                <h3 className="text-xl font-extrabold font-heading mt-1 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-400" /> Request Bank/UPI Payout
                </h3>
              </div>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayoutRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payout Amount (Min ₹500) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 font-extrabold text-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  UPI VPA ID *
                </label>
                <input
                  type="text"
                  required
                  value={requestUpi}
                  onChange={(e) => setRequestUpi(e.target.value)}
                  placeholder="e.g. name@okicici"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Account Details (Optional)
                </label>
                <input
                  type="text"
                  value={bankDetailsInput}
                  onChange={(e) => setBankDetailsInput(e.target.value)}
                  placeholder="Bank Name, Acc No, IFSC Code"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {submitSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>🎉 Payout Request Submitted to Admin for Verification!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary text-xs font-extrabold py-3.5 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Payout Request →'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
