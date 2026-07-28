import React, { useState } from 'react';
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw, 
  Share2, CheckCircle2, TrendingUp, DollarSign, Layers, ChevronRight,
  ExternalLink, Copy, Check, AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ProductDetailView({ product, user, onBack, onSelectTab, onPushProduct }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pushedToShopify, setPushedToShopify] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState('');
  const [pushResult, setPushResult] = useState(null);
  const [copiedSku, setCopiedSku] = useState(false);

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
        <p className="text-slate-500 text-sm">No product selected.</p>
        <button onClick={onBack} className="btn-primary text-xs">
          ← Back to Catalog
        </button>
      </div>
    );
  }

  // Multi-Image Gallery Extraction
  const galleryImages = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean);

  if (galleryImages.length === 0) {
    galleryImages.push("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");
  }

  const wholesaleCost = parseFloat(product.wholesalePrice || 350);
  const shippingFee = parseFloat(product.shippingFee || 75);
  const suggestedMrp = parseFloat(product.suggestedMrp || 1299);
  const totalCost = wholesaleCost + shippingFee;
  const estMargin = Math.max(0, suggestedMrp - totalCost - (suggestedMrp * 0.05));

  const handlePushShopify = async () => {
    const shopifyData = user?.id ? dbService.getUserShopify(user.id) : null;
    if (!shopifyData || !shopifyData.isConnected || !shopifyData.domain || !shopifyData.token) {
      setPushError('No Shopify store connected! Go to Shopify Store Manager first.');
      return;
    }

    setIsPushing(true);
    setPushError('');

    try {
      const response = await fetch('/api/shopify/push-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: shopifyData.domain,
          token: shopifyData.token,
          product: {
            title: product.name,
            description: product.description || '',
            category: product.category || '',
            price: suggestedMrp,
            compare_at_price: Math.round(suggestedMrp * 1.4),
            sku: product.sku || '',
            stock: product.stock || 100,
            image: product.image,
            images: product.images || [product.image],
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onPushProduct && product?.id) onPushProduct(product.id);
        setPushResult(data.shopifyProduct);
        setPushedToShopify(true);
        setTimeout(() => setPushedToShopify(false), 5000);
      } else {
        setPushError(data.error || 'Failed to push product.');
      }
    } catch (err) {
      setPushError(`Network error: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku || 'SKU-360');
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-900">
      
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button onClick={onBack} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Products
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-extrabold truncate max-w-xs">{product.category || 'General'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 truncate max-w-sm font-semibold">{product.name}</span>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5"
        >
          ← Back to Catalog
        </button>
      </div>

      {/* Main Product Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery Slider */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Selected Image Showcase */}
          <div className="relative rounded-3xl bg-white border border-slate-200 p-4 shadow-sm overflow-hidden group">
            <div className="h-80 sm:h-[420px] w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={galleryImages[selectedImageIndex] || galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <span className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg border border-white/20">
              {product.category || 'Trending Catalog'}
            </span>

            <div className="absolute top-6 right-6 bg-emerald-500 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-lg">
              ★ {product.rating || 4.8}
            </div>
          </div>

          {/* Multi-Image Thumbnail Selector */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto p-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Specifications Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Guaranteed Quality & Fulfillment
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold block mb-0.5">Shipping Charge</span>
                <span className="font-black text-slate-900">Flat ₹75 Nationwide</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold block mb-0.5">Dispatch SLA</span>
                <span className="font-black text-emerald-600">24 Hours Guaranteed</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold block mb-0.5">RTO Replacement</span>
                <span className="font-black text-slate-900">Zero Deduction</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold block mb-0.5">Available Stock</span>
                <span className="font-black text-blue-600">{product.stock || 1000}+ Units ready</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Action Center */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Title & SKU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {product.category || 'High Demand'}
                </span>

                <button
                  onClick={handleCopySku}
                  className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedSku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {product.sku || 'SKU-360'}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Margin Breakdown Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-xl border border-slate-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950">
              <div className="grid grid-cols-3 gap-3 text-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Wholesale</span>
                  <span className="text-xl font-black text-white font-heading">₹{wholesaleCost}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">+ Shipping</span>
                  <span className="text-xl font-black text-blue-400 font-heading">₹{shippingFee}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Suggested MRP</span>
                  <span className="text-xl font-black text-amber-400 font-heading">₹{suggestedMrp}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-300 font-bold block">Est. Dropshipper Net Margin:</span>
                  <span className="text-[10px] text-slate-400">After 5% Agency fee & flat ₹75 delivery</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 font-heading">₹{estMargin.toFixed(0)}</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">Profit Per Order</span>
                </div>
              </div>
            </div>

            {/* Push Error Alert */}
            {pushError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p>{pushError}</p>
                  {pushError.includes('connected') && (
                    <button onClick={() => onSelectTab('shopify-manager')} className="underline text-blue-600 font-extrabold mt-1 block">
                      Go to Shopify Store Manager →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom Selling Price Setting */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider">Set Selling Price on Shopify (₹)</label>
                <span className="text-emerald-600 font-bold">Est. Margin: ₹{(suggestedMrp - totalCost - (suggestedMrp * 0.05)).toFixed(0)}</span>
              </div>
              <input
                type="number"
                value={suggestedMrp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (product) product.suggestedMrp = val;
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-sm text-blue-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Main Call to Actions */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handlePushShopify}
                disabled={isPushing}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  pushedToShopify
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Pushing Product to Shopify API...
                  </>
                ) : pushedToShopify ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Live on Shopify Store! 🎉
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" /> 1-Click Push to Shopify Store
                  </>
                )}
              </button>

              {pushResult && pushResult.url && (
                <a
                  href={pushResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> View Live Product on Your Shopify Store →
                </a>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onSelectTab('meta-ads')}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                >
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Launch Meta Ad
                </button>

                <button
                  onClick={() => onSelectTab('source-product')}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" /> Order Sample
                </button>
              </div>
            </div>

            {/* Description Tab */}
            <div className="border-t border-slate-200 pt-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Product Description & Highlights
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.description || "High-margin trending e-commerce product sourced directly by 360 Dropship Network. Ready for instant Shopify store sync and automated nationwide fulfillment."}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
