import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, RefreshCw, Key, AlertCircle, Unlink, HelpCircle, Plus, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ShopifyStoreManagerView({ user, onSelectTab }) {
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [clientIdInput, setClientIdInput] = useState('');
  const [connectedStores, setConnectedStores] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load existing connected stores
  useEffect(() => {
    if (user?.id) {
      const stores = dbService.getUserShopifyStores ? dbService.getUserShopifyStores(user.id) : [];
      // Fallback: load single store from old format
      if (stores.length === 0) {
        const shopifyData = dbService.getUserShopify(user.id);
        if (shopifyData && shopifyData.isConnected) {
          setConnectedStores([{
            id: 'store_1',
            domain: shopifyData.domain || '',
            token: shopifyData.token || '',
            connectedAt: shopifyData.connectedAt || new Date().toISOString(),
            isActive: true
          }]);
        }
      } else {
        setConnectedStores(stores);
      }
    }
  }, [user]);

  // Check for OAuth callback params
  useEffect(() => {
    const hashParams = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashParams);
    const shopifySuccess = params.get('shopify_success');
    const shopifyShop = params.get('shopify_shop');
    const shopifyToken = params.get('shopify_token');
    const shopifyError = params.get('shopify_error');

    if (shopifySuccess && shopifyShop && shopifyToken && user?.id) {
      const newStore = {
        id: `store_${Date.now()}`,
        domain: shopifyShop,
        token: shopifyToken,
        connectedAt: new Date().toISOString(),
        isActive: true
      };
      addStoreToList(newStore);
      setSaveSuccess(shopifyShop);
      setTimeout(() => setSaveSuccess(''), 6000);
      window.history.replaceState({}, '', '/#/dashboard');
    }
    if (shopifyError) {
      setConnectionError(`Shopify Error: ${shopifyError}`);
      window.history.replaceState({}, '', '/#/dashboard');
    }
  }, [user]);

  const userPushedProducts = user?.id ? dbService.getUserPushedProducts(user.id) : [];

  const addStoreToList = (newStore) => {
    setConnectedStores(prev => {
      const exists = prev.find(s => s.domain === newStore.domain);
      const updated = exists ? prev.map(s => s.domain === newStore.domain ? { ...s, ...newStore } : s) : [...prev, newStore];
      // Save all stores
      if (user?.id) {
        dbService.saveUserShopify(user.id, {
          isConnected: true,
          domain: updated[0]?.domain || '',
          token: updated[0]?.token || '',
          connectedAt: updated[0]?.connectedAt || new Date().toISOString(),
          allStores: updated
        });
      }
      return updated;
    });
  };

  const handleConnectStore = async (e) => {
    e.preventDefault();
    setConnectionError('');

    let cleanedDomain = storeDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanedDomain) {
      setConnectionError('Please enter your Shopify store URL (e.g. mystore.myshopify.com)');
      return;
    }
    if (!cleanedDomain.includes('.myshopify.com') && !cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }

    // Check if already connected
    if (connectedStores.find(s => s.domain === cleanedDomain)) {
      setConnectionError('This store is already connected!');
      return;
    }

    const token = accessToken.trim();
    if (!token || token.length < 10) {
      setConnectionError('Please enter a valid API access token or secret. Follow the guide below to get your token.');
      return;
    }

    let finalToken = token;
    if (clientIdInput.trim() && token.startsWith('shpss_') && !token.includes(':')) {
      finalToken = `${clientIdInput.trim()}:${token}`;
    }

    setIsConnecting(true);

    const newStore = {
      id: `store_${Date.now()}`,
      domain: cleanedDomain,
      token: finalToken,
      connectedAt: new Date().toISOString(),
      isActive: true
    };

    setTimeout(() => {
      addStoreToList(newStore);
      setIsConnecting(false);
      setStoreDomain('');
      setAccessToken('');
      setShowAddForm(false);
      setSaveSuccess(cleanedDomain);
      setTimeout(() => setSaveSuccess(''), 5000);
    }, 800);
  };

  const handleDisconnectStore = (storeId) => {
    if (window.confirm('Are you sure you want to disconnect this store?')) {
      setConnectedStores(prev => {
        const updated = prev.filter(s => s.id !== storeId);
        if (user?.id) {
          if (updated.length === 0) {
            dbService.saveUserShopify(user.id, { isConnected: false, domain: '', token: '' });
          } else {
            dbService.saveUserShopify(user.id, {
              isConnected: true,
              domain: updated[0]?.domain || '',
              token: updated[0]?.token || '',
              connectedAt: updated[0]?.connectedAt,
              allStores: updated
            });
          }
        }
        return updated;
      });
    }
  };

  const hasStores = connectedStores.length > 0;

  const handleOAuthConnect = (e) => {
    e.preventDefault();
    setConnectionError('');
    let cleanedDomain = storeDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanedDomain) {
      setConnectionError('Please enter your Shopify store URL (e.g. mystore.myshopify.com)');
      return;
    }
    if (!cleanedDomain.includes('.myshopify.com') && !cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(cleanedDomain)}`;
  };

  const handleCodeExchange = (e) => {
    e.preventDefault();
    setConnectionError('');
    let cleanedDomain = storeDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanedDomain) {
      setConnectionError('Please enter your Shopify store URL (e.g. mystore.myshopify.com)');
      return;
    }
    if (!cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }
    const cleanCode = accessToken.trim();
    if (!cleanCode) {
      setConnectionError('Please paste your Shopify authorization code or token');
      return;
    }
    window.location.href = `/api/shopify/callback?shop=${encodeURIComponent(cleanedDomain)}&code=${encodeURIComponent(cleanCode)}`;
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in text-slate-900 mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated E-Commerce Sync Engine</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Shopify Store Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Connect your Shopify stores to enable 1-Click Product Push & Automated Order Sync.
        </p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>✅ Store <strong>{saveSuccess}</strong> connected successfully! Product push & order sync activated.</span>
        </div>
      )}

      {/* Connected Stores List */}
      {hasStores && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Connected Stores ({connectedStores.length})
          </h2>

          <div className="grid gap-3">
            {connectedStores.map((store) => (
              <div key={store.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm font-mono">{store.domain}</h3>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> CONNECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      1-Click Product Push Active • Auto Order Sync Enabled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  <a
                    href={`https://${store.domain}/admin`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Admin
                  </a>
                  <button
                    onClick={() => handleDisconnectStore(store.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Disconnect Store"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Store Form or Add Button */}
      {hasStores && !showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-slate-600 hover:text-blue-600 font-extrabold text-xs flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-blue-50/50"
        >
          <Plus className="w-4 h-4" /> Add Another Shopify Store
        </button>
      ) : (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">Connect New Shopify Store</h2>
              <p className="text-xs text-slate-500">Choose 1-Click Auto Connect or Manual Token Entry</p>
            </div>
            {hasStores && (
              <button onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                Cancel ✕
              </button>
            )}
          </div>

          {connectionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{connectionError}</span>
            </div>
          )}

          {/* UNIFIED SINGLE CONNECTION FORM */}
          <form onSubmit={handleConnectStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                1. Shopify Store URL / Handle *
              </label>
              <input
                type="text"
                required
                value={storeDomain}
                onChange={(e) => { setStoreDomain(e.target.value); setConnectionError(''); }}
                placeholder="my-brand-store.myshopify.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Client ID *
              </label>
              <input
                type="text"
                required
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 6ba2828599b7ed2b6c32dcb5e187652a"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Found in your Shopify Dev Dashboard Settings or App Overview.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                3. Client Secret / Access Token (shpss_... or shpat_...) *
              </label>
              <input
                type="password"
                required
                value={accessToken}
                onChange={(e) => { setAccessToken(e.target.value); setConnectionError(''); }}
                placeholder="shpss_xxxxxxxx... OR shpat_xxxxxxxx..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Paste your <code className="text-slate-700 font-bold">shpss_...</code> Client Secret or <code className="text-slate-700 font-bold">shpat_...</code> Access Token.</p>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all mt-2"
            >
              {isConnecting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting Store...</>
              ) : (
                '🚀 Connect Shopify Store'
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase">OR (1-CLICK AUTO LOGIN)</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleOAuthConnect}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>⚡ 1-Click Connect via Shopify Login Redirect</span>
          </button>
        </div>
      )}

      {/* Browse Products CTA */}
      {hasStores && (
        <div className="flex justify-end">
          <button onClick={() => onSelectTab('all-products')} className="btn-primary text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2">
            Browse Catalog & Push Products →
          </button>
        </div>
      )}

      {/* HOW TO GET YOUR TOKEN — Step by Step Guide (English) */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-blue-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-heading">How to Get Your API Token (5 Easy Steps)</h3>
            <p className="text-xs text-slate-400">Follow these steps in your Shopify Admin panel — it's 100% free!</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 1</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Open Your Shopify Admin</h4>
              <p className="text-slate-400">Go to <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">https://YOUR-STORE.myshopify.com/admin</code></p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 2</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Enable Custom App Development</h4>
              <p className="text-slate-400"><strong className="text-slate-200">Settings</strong> (gear icon) → <strong className="text-slate-200">Apps and sales channels</strong> → <strong className="text-slate-200">Develop apps</strong> → Click <strong className="text-cyan-400">"Allow custom app development"</strong></p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 3</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Create a Custom App</h4>
              <p className="text-slate-400">Click <strong className="text-cyan-400">"Create an app"</strong> → Name it <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">360 Dropship</code> → Click <strong className="text-slate-200">Create app</strong></p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 4</span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">Configure API Permissions</h4>
              <p className="text-slate-400">Click <strong className="text-cyan-400">"Configure Admin API scopes"</strong> → Enable: <code className="text-cyan-400 bg-slate-700 px-1.5 py-0.5 rounded">read_products, write_products, read_orders, write_orders</code> → <strong className="text-slate-200">Save</strong></p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-emerald-900/40 rounded-2xl border border-emerald-700/50 flex gap-3">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase h-fit shrink-0">Step 5</span>
            <div>
              <h4 className="font-bold text-emerald-300 text-sm mb-1">Install App & Copy Token ✅</h4>
              <p className="text-slate-400">
                Go to <code className="text-emerald-400 bg-slate-700 px-1.5 py-0.5 rounded">API credentials</code> tab → Click <strong className="text-emerald-400">"Install app"</strong> → Click <strong className="text-emerald-400">"Reveal token once"</strong>.<br />
                <span className="text-amber-400 font-bold">⚠️ Note:</span> Copy the <code className="text-emerald-400 bg-slate-700 px-1.5 py-0.5 rounded">Admin API Access Token</code> (starts with <code className="text-emerald-400">shpat_</code>), NOT the API Secret Key (<code className="text-slate-400">shpss_</code>). Paste it above!
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-bold flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>The token is shown <strong>only once</strong> — copy it immediately! If lost, uninstall and reinstall the app to generate a new one. This method is 100% free with no charges.</span>
        </div>
      </div>

    </div>
  );
}
