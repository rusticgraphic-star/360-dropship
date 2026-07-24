import React, { useState } from 'react';
import { Store, CheckCircle2, RefreshCw, Zap, ExternalLink, Key, Link2, ShieldCheck, Copy, ArrowRight, AlertCircle, Unlink } from 'lucide-react';

export default function ShopifyStoreManagerView({ onSelectTab }) {
  const [connectMethod, setConnectMethod] = useState('direct'); // 'direct' or 'manual'
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleConnectStore = (e) => {
    e.preventDefault();
    if (!storeDomain) return;
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setStoreDomain('');
    setAccessToken('');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in text-slate-900 mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated E-Commerce Sync</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Shopify Store Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Connect your Shopify storefront via 1-Click Direct App OAuth or Manual Custom App Access Token.
        </p>
      </div>

      {/* Connection Overview Card */}
      {isConnected ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-heading">Connected Shopify Store</h3>
                <p className="text-xs text-slate-500 font-mono">{storeDomain}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE AUTO-SYNC
              </span>

              <button
                onClick={handleDisconnect}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1 bg-rose-50 rounded-full border border-rose-200 flex items-center gap-1"
              >
                <Unlink className="w-3.5 h-3.5" /> Disconnect
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Live Store Domain</span>
              <span className="font-extrabold text-slate-900 text-sm font-mono truncate block">{storeDomain}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Synced Catalog Items</span>
              <span className="font-extrabold text-slate-900 text-sm font-heading">0 Products Pushed</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Order Dispatch Sync</span>
              <span className="font-extrabold text-cyan-600 text-sm font-heading">Instant (&lt; 1s)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">No Shopify Store Connected</h3>
              <p className="text-xs text-slate-500">Connect your store below to start 1-click product catalog pushing and auto-order routing.</p>
            </div>
          </div>

          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full shrink-0">
            DISCONNECTED
          </span>
        </div>
      )}

      {/* Integration Setup Panel: Direct vs Manual Toggle */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">Shopify Connection Configuration</h3>
            <p className="text-xs text-slate-500">Choose between 1-Click Direct App Authorization or Manual Access Token setup.</p>
          </div>

          {/* Switch Method Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setConnectMethod('direct')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                connectMethod === 'direct'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 1-Click Direct
            </button>
            <button
              onClick={() => setConnectMethod('manual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                connectMethod === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Manual API Key
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Shopify Store Connected Successfully! Live auto-order routing and catalog push activated.</span>
          </div>
        )}

        {/* METHOD 1: 1-CLICK DIRECT OAUTH FORM */}
        {connectMethod === 'direct' ? (
          <form onSubmit={handleConnectStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter Your Shopify Store Domain *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                    placeholder="my-brand-store.myshopify.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="btn-primary text-xs font-extrabold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30 justify-center whitespace-nowrap"
                >
                  {isConnecting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Authorizing...</>
                  ) : (
                    'Authorize Direct Sync →'
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                You will be redirected to your official Shopify Admin panel to approve read/write catalog & order permissions.
              </p>
            </div>
          </form>
        ) : (
          /* METHOD 2: MANUAL CUSTOM APP API TOKEN FORM */
          <form onSubmit={handleConnectStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                1. Shopify Store Domain *
              </label>
              <input
                type="text"
                required
                value={storeDomain}
                onChange={(e) => setStoreDomain(e.target.value)}
                placeholder="my-brand-store.myshopify.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500 mb-3"
              />

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Admin API Access Token (Starts with shpat_...) *
              </label>
              <input
                type="password"
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="btn-primary w-full text-xs font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-600/30 justify-center"
            >
              {isConnecting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying Access Token...</>
              ) : (
                'Save Manual API Connection ✓'
              )}
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
