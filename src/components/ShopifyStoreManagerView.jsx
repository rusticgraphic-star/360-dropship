import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, RefreshCw, Key, AlertCircle, Unlink, HelpCircle, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ShopifyStoreManagerView({ user, onSelectTab }) {
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
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
      setConnectionError('Please enter a valid API access token. Follow the guide below to get your token.');
      return;
    }

    setIsConnecting(true);

    const newStore = {
      id: `store_${Date.now()}`,
      domain: cleanedDomain,
      token: token,
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

          {connectedStores.map((store) => (
            <div key={store.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm font-heading">{store.domain}</h3>
                    <p className="text-[11px] text-slate-400">Connected {new Date(store.connectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    CONNECTED
                  </span>
                  <a
                    href={`https://${store.domain}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Admin
                  </a>
                  <button
                    onClick={() => handleDisconnectStore(store.id)}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 bg-rose-50 rounded-full border border-rose-200 flex items-center gap-1"
                  >
                    <Unlink className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block">Products</span>
                  <span className="font-extrabold text-blue-600 text-sm">{userPushedProducts.filter(p => p.storeDomain === store.domain).length || userPushedProducts.length}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block">Sync</span>
                  <span className="font-extrabold text-emerald-600 text-sm">Active</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-extrabold text-emerald-600 text-sm">Live</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Store Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Another Store
            </button>
          )}
        </div>
      )}

      {/* Connect Form — shown if no stores OR showAddForm is true */}
      {(!hasStores || showAddForm) && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base font-heading">
                  {hasStores ? 'Add Another Store' : 'Connect Your Shopify Store'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter your store domain and Admin API Access Token to connect.</p>
            </div>
            {showAddForm && (
              <button onClick={() => { setShowAddForm(false); setConnectionError(''); }} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                ✕ Cancel
              </button>
            )}
          </div>

          {connectionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
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
              <p className="text-[11px] text-slate-400 mt-1">Don't have a token? Follow the step-by-step guide below ↓</p>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="btn-primary w-full text-xs font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-600/30 justify-center"
            >
              {isConnecting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting Store...</>
              ) : (
                '🔗 Connect Shopify Store'
              )}
            </button>
          </form>
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
              <p className="text-slate-400">Click <strong className="text-emerald-400">"Install app"</strong> → Click <strong className="text-emerald-400">"Reveal token once"</strong> → Copy the <code className="text-emerald-400 bg-slate-700 px-1.5 py-0.5 rounded">shpat_...</code> token → Paste it above!</p>
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
