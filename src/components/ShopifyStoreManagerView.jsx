import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, RefreshCw, Zap, ExternalLink, Key, Link2, ShieldCheck, Copy, ArrowRight, AlertCircle, Unlink, HelpCircle, Check } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ShopifyStoreManagerView({ user, onSelectTab }) {
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  // Check for OAuth callback params in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    const shopifySuccess = params.get('shopify_success');
    const shopifyShop = params.get('shopify_shop');
    const shopifyToken = params.get('shopify_token');
    const shopifyError = params.get('shopify_error');

    if (shopifySuccess && shopifyShop && shopifyToken && user?.id) {
      // OAuth completed successfully — save the connection
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

      // Clean URL
      window.history.replaceState({}, '', '/#/dashboard');
    }

    if (shopifyError) {
      setConnectionError(`Shopify OAuth Error: ${shopifyError}`);
      window.history.replaceState({}, '', '/#/dashboard');
    }
  }, [user]);

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

  // 1-Click OAuth: redirect to our backend API which handles everything
  // Shopify Custom App Install Link (from Partner Dashboard)
  const SHOPIFY_INSTALL_URL = 'https://admin.shopify.com/oauth/install_custom_app?client_id=59b669059770244c0513bec02b008c6b&no_redirect=true&signature=eyJleHBpcmVzX2F0IjoxNzg1NzY5NzMyLCJwZXJtYW5lbnRfZG9tYWluIjoicXRuY3FnLXdzLm15c2hvcGlmeS5jb20iLCJjbGllbnRfaWQiOiI1OWI2NjkwNTk3NzAyNDRjMDUxM2JlYzAyYjAwOGM2YiIsInB1cnBvc2UiOiJjdXN0b21fYXBwIiwibWVyY2hhbnRfb3JnYW5pemF0aW9uX2lkIjoyMTg2OTgxNjB9--dab08856cc392c6dcc7a39ea921592b6566fb018';

  const handleOAuthConnect = (e) => {
    e.preventDefault();
    let cleanedDomain = storeDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanedDomain) {
      alert('Apna Shopify Store URL daalo (e.g. mystore.myshopify.com)');
      return;
    }
    if (!cleanedDomain.includes('.myshopify.com') && !cleanedDomain.includes('.')) {
      cleanedDomain = `${cleanedDomain}.myshopify.com`;
    }

    setIsConnecting(true);

    // Save domain locally first
    if (user?.id) {
      dbService.saveUserShopify(user.id, {
        isConnected: false,
        domain: cleanedDomain,
        pendingConnect: true,
        connectedAt: new Date().toISOString()
      });
    }

    // Open Shopify install link — after install, use OAuth to get token
    window.open(SHOPIFY_INSTALL_URL, '_blank');

    // After opening install link, also trigger OAuth for token exchange
    setTimeout(() => {
      window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(cleanedDomain)}`;
    }, 2000);
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
              <p className="text-xs text-slate-500">Connect your Shopify store with 1-click OAuth — fully automated, no manual token needed.</p>
            </div>
          </div>

          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full shrink-0">
            DISCONNECTED
          </span>
        </div>
      )}

      {/* 1-CLICK OAUTH CONNECTION FORM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base font-heading">⚡ 1-Click Shopify Connect</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Apna store domain daalo aur connect karo — backend automatically OAuth handle karega, koi manual token ki zaroorat nahi!</p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>✅ Shopify Store Connected Successfully! Live auto-order routing and catalog push activated.</span>
          </div>
        )}

        {connectionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{connectionError}</span>
          </div>
        )}

        <form onSubmit={handleOAuthConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Shopify Store Domain *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={storeDomain}
                  onChange={(e) => { setStoreDomain(e.target.value); setConnectionError(''); }}
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
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Redirecting to Shopify...</>
                ) : (
                  '⚡ Connect Store →'
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Apna Shopify store URL daalo (e.g. <code>mybrand.myshopify.com</code>) aur Connect karo. Shopify permission screen aayegi — approve karo aur done! ✅
            </p>
          </div>
        </form>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-blue-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-heading">Kaise Kaam Karta Hai? (Automatic)</h3>
            <p className="text-xs text-slate-400">Poora process automated hai — bas 2 click me done!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Step 1</span>
            <h4 className="font-bold text-slate-200 text-sm">Store URL Daalo</h4>
            <p className="text-slate-400 leading-relaxed">
              Upar box me apna Shopify store URL type karo (e.g. <code className="text-cyan-400">mybrand.myshopify.com</code>)
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Step 2</span>
            <h4 className="font-bold text-slate-200 text-sm">Shopify Permission Approve Karo</h4>
            <p className="text-slate-400 leading-relaxed">
              Shopify ki official screen aayegi — <strong>"Install app"</strong> click karo. Products & Orders access approve hoga.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Done!</span>
            <h4 className="font-bold text-emerald-300 text-sm">Auto-Connected ✅</h4>
            <p className="text-slate-400 leading-relaxed">
              Automatically wapas dashboard pe aa jaoge — store connected, products sync ready! 🚀
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
