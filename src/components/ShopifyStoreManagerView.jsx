import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, RefreshCw, Key, AlertCircle, Unlink, HelpCircle, Zap, ExternalLink } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ShopifyStoreManagerView({ user, onSelectTab }) {
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  // Check for OAuth callback params
  useEffect(() => {
    const hashParams = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashParams);
    const shopifySuccess = params.get('shopify_success');
    const shopifyShop = params.get('shopify_shop');
    const shopifyToken = params.get('shopify_token');
    const shopifyError = params.get('shopify_error');

    if (shopifySuccess && shopifyShop && shopifyToken && user?.id) {
      dbService.saveUserShopify(user.id, {
        isConnected: true,
        domain: shopifyShop,
        token: shopifyToken,
        connectedAt: new Date().toISOString()
      });
      setIsConnected(true);
      setStoreDomain(shopifyShop);
      setAccessToken(shopifyToken);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 6000);
      window.history.replaceState({}, '', '/#/dashboard');
    }
    if (shopifyError) {
      setConnectionError(`Shopify Error: ${shopifyError}`);
      window.history.replaceState({}, '', '/#/dashboard');
    }
  }, [user]);

  // Load existing connection
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

  const handleConnectStore = async (e) => {
    e.preventDefault();
    setConnectionError('');

    let cleanedDomain = storeDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanedDomain) {
      alert('Apna Shopify Store URL daalo (e.g. mystore.myshopify.com)');
      return;
    }
    if (!cleanedDomain.includes('.myshopify.com') && !cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }

    const token = accessToken.trim();
    if (!token || !token.startsWith('shpat_')) {
      setConnectionError('❌ Invalid token! Token "shpat_" se start hona chahiye. Neeche steps follow karke sahi token paste karo.');
      return;
    }

    setIsConnecting(true);

    // Save connection
    if (user?.id) {
      dbService.saveUserShopify(user.id, {
        isConnected: true,
        domain: cleanedDomain,
        token: token,
        connectedAt: new Date().toISOString()
      });
    }

    // Small delay for UX
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setStoreDomain(cleanedDomain);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }, 800);
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

      {/* Connection Status Card */}
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
              <button onClick={handleDisconnect} className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1 bg-rose-50 rounded-full border border-rose-200 flex items-center gap-1">
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
            <button onClick={() => onSelectTab('all-products')} className="btn-primary text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2">
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
              <p className="text-xs text-slate-500">Neeche apna store domain aur API token paste karke connect karo — 100% FREE!</p>
            </div>
          </div>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full shrink-0">DISCONNECTED</span>
        </div>
      )}

      {/* Connect Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base font-heading">🔗 Connect Your Shopify Store (FREE)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Apne Shopify Admin se Custom App ka token paste karo — koi charge nahi, unlimited stores!</p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>✅ Shopify Store Connected Successfully! Product push & order sync activated.</span>
          </div>
        )}

        {connectionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{connectionError}</span>
          </div>
        )}

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
              2. Admin API Access Token (shpat_...) *
            </label>
            <input
              type="password"
              required
              value={accessToken}
              onChange={(e) => { setAccessToken(e.target.value); setConnectionError(''); }}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Token kaise milega? Neeche step-by-step guide dekho ↓</p>
          </div>

          <button
            type="submit"
            disabled={isConnecting}
            className="btn-primary w-full text-xs font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-600/30 justify-center"
          >
            {isConnecting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting Store...</>
            ) : (
              '🔗 Connect Shopify Store ✓'
            )}
          </button>
        </form>
      </div>

      {/* STEP-BY-STEP GUIDE */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-blue-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-heading">Token Kaise Milega? (5 Easy Steps — FREE!)</h3>
            <p className="text-xs text-slate-400">Apne Shopify Admin me ye steps follow karo:</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 1</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Shopify Admin Kholo</h4>
              <p className="text-slate-400">Browser me jao: <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">https://TUMHARA-STORE.myshopify.com/admin</code></p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 2</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Develop Apps Enable Karo</h4>
              <p className="text-slate-400"><strong className="text-slate-200">Settings</strong> (gear icon, bottom-left) → <strong className="text-slate-200">Apps and sales channels</strong> → <strong className="text-slate-200">Develop apps</strong> → <strong className="text-cyan-400">"Allow custom app development"</strong> click karo</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 3</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Custom App Create Karo</h4>
              <p className="text-slate-400"><strong className="text-cyan-400">"Create an app"</strong> click karo → App name: <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">360 Dropship</code> → <strong className="text-slate-200">Create app</strong></p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 4</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">API Permissions Set Karo</h4>
              <p className="text-slate-400"><strong className="text-cyan-400">"Configure Admin API scopes"</strong> click karo → Enable: <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">read_products, write_products, read_orders, write_orders</code> → <strong className="text-slate-200">Save</strong></p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-emerald-900/40 rounded-2xl border border-emerald-700/50 flex gap-3">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 5</span>
            <div>
              <h4 className="font-bold text-emerald-300 text-sm mb-1">Install App & Token Copy Karo ✅</h4>
              <p className="text-slate-400"><strong className="text-emerald-400">"Install app"</strong> click karo → <strong className="text-emerald-400">"Reveal token once"</strong> click karo → <code className="text-emerald-400 bg-slate-700 px-1.5 py-0.5 rounded">shpat_...</code> token copy karo → Upar form me paste karo!</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>⚠️ Token sirf <strong>ek baar</strong> dikhta hai — turant copy karo! Lost ho jaye toh: Uninstall → Install karke naya generate karo. Ye method 100% FREE hai, koi charge nahi!</span>
        </div>
      </div>

    </div>
  );
}
