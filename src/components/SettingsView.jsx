import React, { useState } from 'react';
import { Settings, QrCode, Key, Building, CheckCircle2, Save, AlertCircle } from 'lucide-react';

export default function SettingsView({ currentUpiId, onSaveUpiId }) {
  const [upiId, setUpiId] = useState(currentUpiId || '360dropship@upi');
  const [metaToken, setMetaToken] = useState('EAABwz11409124018240981409124');
  const [adAccountId, setAdAccountId] = useState('act_998410294');
  const [gstin, setGstin] = useState('27AAAAA0000A1Z5');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveUpiId(upiId);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Agency & Platform Configuration</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Platform Settings & API Config
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Configure your Agency Dynamic UPI ID, Meta Marketing Graph API tokens, and GST taxation settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. DYNAMIC UPI ID CONFIGURATION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">Agency UPI ID for Dynamic QR Payment</h3>
              <p className="text-xs text-slate-500">This UPI VPA will be encoded into all dynamic QR codes generated for dropshipper wallet recharges.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Custom Agency UPI ID (VPA)</label>
            <input
              type="text"
              placeholder="e.g. 8888888888@upi or yourbusiness@okaxis"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Example: <code>agency360@okaxis</code> or <code>9820144521@paytm</code>
            </p>
          </div>
        </div>

        {/* 2. META GRAPH API CONFIGURATION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">Meta Agency Account Credentials</h3>
              <p className="text-xs text-slate-500">Used for automated campaign pause (`PAUSED`) when dropshipper wallet balance reaches ₹0.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agency Ad Account ID</label>
              <input
                type="text"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Agency Access Key</label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. GSTIN TAXATION & BUSINESS INFO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">GSTIN & Business Billing Info</h3>
              <p className="text-xs text-slate-500">Printed on 18% GST tax invoices generated during wallet recharge.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Tax Registration Number</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Settings saved! Dynamic UPI QR Code generator updated with UPI ID: {upiId}.
          </div>
        )}

        <button
          type="submit"
          className="btn-primary text-sm font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>

      </form>

    </div>
  );
}
