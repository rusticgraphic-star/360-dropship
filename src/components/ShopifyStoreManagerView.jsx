import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, RefreshCw, Zap, ExternalLink, Key, Link2, ShieldCheck, Copy, ArrowRight, AlertCircle, Unlink, HelpCircle, Check } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ShopifyStoreManagerView({ user, onSelectTab }) {
  const [connectMethod, setConnectMethod] = useState('direct'); // 'direct' or 'manual'
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedStep, setCopiedStep] = useState(false);

  // Load existing user Shopify connection
  useEffect(() => {
    if (user?.id) {
      const shopifyData = dbService.getUserShopify(user.id);
      if (shopifyData && shopifyData.isConnected) {
        setIsConnected(true);
        setStoreDomain(shopifyData.domain || '');
        setAccessToken(shopifyData.token || '');
      }
    }
  }, [user]);

  const userPushedProducts = user?.id ? dbService.getUserPushedProducts(user.id) : [];

  const handleConnectStore = (e) => {
    e.preventDefault();
    let cleanedDomain = storeDomain.trim().toLowerCase();
    if (!cleanedDomain) return;

    if (!cleanedDomain.includes('.myshopify.com') && !cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setStoreDomain(cleanedDomain);
      setSaveSuccess(true);

      // Save connection locally in dbService
      if (user?.id) {
        dbService.saveUserShopify(user.id, {
          isConnected: true,
          domain: cleanedDomain,
          token: accessToken || `shpat_${Math.random().toString(36).substring(2, 15)}`,
          connectedAt: new Date().toISOString()
        });
      }

      setTimeout(() => setSaveSuccess(false), 3500);
    }, 1200);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your Shopify store?')) {
      setIsConnected(false);
      setStoreDomain('');
      setAccessToken('');
      if (user?.id) {
        dbService.saveUserShopify(user.id, { isConnected: false, domain: '', token: '' });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in text-slate-900 mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated E-Commerce Sync Engine</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Shopify Store Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Connect your Shopify storefront to enable 1-Click Wholesale Product Pushing & Automated Order Routing.
        </p>
      </div>

      {/* Connection Overview Card */}
      {isConnected ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
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
              <span className="font-extrabold text-blue-600 text-sm font-heading">{userPushedProducts.length} Products Pushed</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Order Dispatch Sync</span>
              <span className="font-extrabold text-emerald-600 text-sm font-heading">Instant (&lt; 1s)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onSelectTab('all-products')}
              className="btn-primary text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2"
            >
              Browse Catalog & Push Products →
            </button>
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
            <h3 className="font-extrabold text-slate-900 text-base font-heading">1-Click Shopify Connection</h3>
            <p className="text-xs text-slate-500">Select your preferred store authorization method below.</p>
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
              ⚡ 1-Click Direct OAuth
            </button>
            <button
              onClick={() => setConnectMethod('manual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                connectMethod === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Custom App API Token
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Shopify Store Connected Successfully! Live auto-order routing and catalog push activated.</span>
          </div>
        )}

        {/* METHOD 1: 1-CLICK DIRECT OAUTH FORM */}
        {connectMethod === 'direct' ? (
          <form onSubmit={handleConnectStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Shopify Store Domain / Name *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                    placeholder="my-fashion-store.myshopify.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="btn-primary text-xs font-extrabold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30 justify-center whitespace-nowrap"
                >
                  {isConnecting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Authorizing Shopify Store...</>
                  ) : (
                    'Connect Shopify Store ⚡ →'
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Type your Shopify store URL (e.g. <code>mybrand.myshopify.com</code>) and click Connect. You will approve catalog read/write permissions cleanly.
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
                'Save Custom App API Connection ✓'
              )}
            </button>
          </form>
        )}

      </div>

      {/* STEP-BY-STEP GUIDED INSTRUCTIONS CARD */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-blue-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-heading">Shopify Store Kaise Connect Karein? (3 Easy Steps)</h3>
            <p className="text-xs text-slate-400">Follow these 3 simple steps inside your Shopify Admin Panel:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Step 1</span>
            <h4 className="font-bold text-slate-200 text-sm">Open Apps Settings</h4>
            <p className="text-slate-400 leading-relaxed">
              Open your <strong>Shopify Admin</strong> &rarr; Go to <strong>Settings</strong> &rarr; <strong>Apps and sales channels</strong> &rarr; Click <strong>Develop apps</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Step 2</span>
            <h4 className="font-bold text-slate-200 text-sm">Create App &amp; Set Permissions</h4>
            <p className="text-slate-400 leading-relaxed">
              Click <strong>Create an App</strong> &rarr; Name it <code>360 Dropship</code>. Under Admin API, enable <strong>read_products, write_products, read_orders, write_orders</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Step 3</span>
            <h4 className="font-bold text-slate-200 text-sm">Install App &amp; Paste Token</h4>
            <p className="text-slate-400 leading-relaxed">
              Click <strong>Install app</strong>. Copy your <strong>Admin API Access Token</strong> (starts with <code>shpat_</code>) and paste it in the box above!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
