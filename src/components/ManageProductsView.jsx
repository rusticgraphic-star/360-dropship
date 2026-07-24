import React, { useState } from 'react';
import { 
  Package, Search, Filter, Plus, FileSpreadsheet, Play, CheckCircle2, 
  ShoppingBag, ArrowRight, Video, Tag, DollarSign, PackageCheck, Eye, X, 
  Truck, ShieldCheck, Info, Copy, ChevronLeft, ChevronRight, Calculator, RefreshCw, Scale, RefreshCcw
} from 'lucide-react';
import ProfitCalculatorModal from './ProfitCalculatorModal';

export default function ManageProductsView({ products, onOpenBulkUpload, onSelectTab, viewModeFilter = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modal States
  const [viewDetailProduct, setViewDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showProfitCalc, setShowProfitCalc] = useState(false);
  const [calcSellingPrice, setCalcSellingPrice] = useState(1499);

  const [profitCalcProduct, setProfitCalcProduct] = useState(null);
  const [selectedProductForShopify, setSelectedProductForShopify] = useState(null);
  const [customMarkupPrice, setCustomMarkupPrice] = useState(999);
  const [pushedSuccess, setPushedSuccess] = useState(false);

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  // If viewModeFilter is 'my', show ONLY user-pushed products (or empty array for new dropshipper)
  const baseProductsList = viewModeFilter === 'my' ? [] : products;

  const filteredProducts = baseProductsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePushToShopify = (e) => {
    e.preventDefault();
    setPushedSuccess(true);
    setTimeout(() => {
      setPushedSuccess(false);
      setSelectedProductForShopify(null);
      setViewDetailProduct(null);
    }, 1800);
  };

  // Sample multi-image thumbnails gallery generator
  const getProductGallery = (prod) => {
    if (!prod) return [];
    return [
      prod.image,
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80"
    ];
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            {viewModeFilter === 'my' ? 'Pushed Store Inventory' : '10,000+ Wholesale Catalog'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
            {viewModeFilter === 'my' ? 'My Products' : 'All Products Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {viewModeFilter === 'my'
              ? 'View products active on your connected Shopify store and track stock levels.'
              : 'Click any product to view images, specs, flat ₹75 shipping cost, and profit margin breakdown.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('shopify-manager')}
            className="btn-primary text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/30"
          >
            Manage Shopify Store →
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Product Catalog Grid or Blank State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const baseCost = product.wholesalePrice + product.shippingFee;
            const estProfit = product.suggestedMrp - baseCost - (product.suggestedMrp * 0.05);

            return (
              <div
                key={product.id}
                onClick={() => { setViewDetailProduct(product); setActiveImageIndex(0); setCalcSellingPrice(product.suggestedMrp); }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Product Image & Tags */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <span className="absolute top-3 left-3 bg-white/95 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
                      {product.category}
                    </span>

                    <span className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      In Stock ({product.stock})
                    </span>

                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> View Details & Specs
                      </span>
                    </div>
                  </div>

                  {/* Info Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug font-heading group-hover:text-blue-600 transition-colors mb-1">
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-mono mb-3">
                      SKU: {product.sku}
                    </p>

                    {/* Financial Breakdown Card */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700 mb-4">
                      <div className="flex justify-between text-slate-900 font-extrabold text-sm border-b border-slate-200 pb-1">
                        <span>Wholesale Base Cost:</span>
                        <span className="text-blue-600">₹{baseCost}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Product + Flat ₹75 Shipping:</span>
                        <span>₹{product.wholesalePrice} + ₹{product.shippingFee}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-extrabold text-xs pt-1 border-t border-slate-200">
                        <span>Suggested Selling MRP:</span>
                        <span>₹{product.suggestedMrp}</span>
                      </div>
                      <div className="flex justify-between text-cyan-700 font-black text-xs">
                        <span>Est. Net Profit Margin:</span>
                        <span>₹{estProfit.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductForShopify(product);
                      setCustomMarkupPrice(product.suggestedMrp);
                    }}
                    className="w-full btn-primary text-xs justify-center py-3 font-extrabold rounded-xl shadow-md shadow-blue-600/30"
                  >
                    {viewModeFilter === 'my' ? 'Update Price on Shopify →' : 'Push to Shopify Store →'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">No Pushed Products Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't pushed any items to your Shopify store yet. Browse our 10,000+ wholesale catalog to push your first trending product!
          </p>
          <button
            onClick={() => onSelectTab('all-products')}
            className="btn-primary text-xs font-bold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30"
          >
            Browse All Products Catalog →
          </button>
        </div>
      )}

      {/* DETAILED PRODUCT SPECS & IMAGES MODAL (DROPDASH STYLE FULLSCREEN OVERLAY) */}
      {viewDetailProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-6xl w-full text-slate-900 shadow-2xl overflow-hidden animate-fade-in my-auto">
            
            {/* Top Navigation & Back Header */}
            <div className="p-4 sm:p-6 bg-white border-b border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setViewDetailProduct(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Products
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl">
                  {viewDetailProduct.sku}
                </span>
                <button
                  onClick={() => handleCopyCode(viewDetailProduct.sku)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedCode ? 'Copied ✓' : 'Copy Code'}
                </button>
                <button
                  onClick={() => setViewDetailProduct(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Product Layout Grid */}
            <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[calc(90vh-90px)] overflow-y-auto no-scrollbar">
              
              {/* LEFT COLUMN: 6-THUMBNAIL VERTICAL COLUMN & MAIN CAROUSEL IMAGE */}
              <div className="lg:col-span-6 flex gap-4">
                
                {/* Thumbnails Sidebar Column */}
                <div className="flex flex-col gap-2.5 shrink-0 overflow-y-auto max-h-[420px] no-scrollbar">
                  {getProductGallery(viewDetailProduct).map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105 shadow-md'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main Interactive Carousel Display */}
                <div className="flex-1 h-[420px] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md relative group">
                  <img
                    src={getProductGallery(viewDetailProduct)[activeImageIndex]}
                    alt={viewDetailProduct.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />

                  {/* Carousel Left/Right Buttons */}
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : getProductGallery(viewDetailProduct).length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-800 hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < getProductGallery(viewDetailProduct).length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-800 hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Counter Pill */}
                  <span className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-lg">
                    {activeImageIndex + 1} / {getProductGallery(viewDetailProduct).length}
                  </span>
                </div>

              </div>

              {/* RIGHT COLUMN: PRODUCT TITLE, PRICING CARD, METRICS GRID, ACTIONS & SPECS */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Title & Copy */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-snug">
                    {viewDetailProduct.name}
                  </h2>
                </div>

                {/* Main Wholesale Price Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-blue-600 font-heading">
                      ₹{viewDetailProduct.wholesalePrice + viewDetailProduct.shippingFee}
                    </span>
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ₹{viewDetailProduct.suggestedMrp}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                      65% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Including GST and Flat ₹75 Courier Shipping Charges
                  </p>
                </div>

                {/* 4-Grid Key Specs Cards */}
                <div className="grid grid-cols-2 gap-3">
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">IN STOCK</span>
                    <span className="font-extrabold text-emerald-600 text-sm">{viewDetailProduct.stock} units</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">WEIGHT</span>
                    <span className="font-extrabold text-slate-900 text-sm">450 g</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">RTO CHARGE</span>
                    <span className="font-extrabold text-amber-600 text-sm">₹75 per return</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">ORDERS (30 DAYS)</span>
                    <span className="font-extrabold text-blue-600 text-sm">340 Orders</span>
                  </div>

                </div>

                {/* Delivery Rate Status Pill */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Dispatch Speed & Delivery Rate</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    ● VERY HIGH (24 HRS DISPATCH)
                  </span>
                </div>

                {/* Action Buttons: Profit Calculator & Push to Shopify */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <button
                    onClick={() => setProfitCalcProduct(viewDetailProduct)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Calculator className="w-4 h-4" /> Profit Calculator
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProductForShopify(viewDetailProduct);
                      setCustomMarkupPrice(viewDetailProduct.suggestedMrp);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Push to Shopify
                  </button>

                </div>

                {/* EXPANDABLE PROFIT CALCULATOR */}
                {showProfitCalc && (
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3 animate-fade-in text-xs">
                    <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">INTERACTIVE PROFIT CALCULATOR</span>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Selling Price on Shopify (₹)</label>
                      <input
                        type="number"
                        value={calcSellingPrice}
                        onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-purple-200 text-slate-700">
                      <div className="flex justify-between">
                        <span>Customer Price:</span>
                        <span className="font-bold">₹{calcSellingPrice}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>- 360 Base Cost (Product + Shipping):</span>
                        <span>-₹{viewDetailProduct.wholesalePrice + viewDetailProduct.shippingFee}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>- 5% Agency Ad Fee:</span>
                        <span>-₹{(calcSellingPrice * 0.05).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-extrabold text-sm border-t border-purple-200 pt-2">
                        <span>Net Profit / Sale:</span>
                        <span>₹{(calcSellingPrice - (viewDetailProduct.wholesalePrice + viewDetailProduct.shippingFee) - (calcSellingPrice * 0.05)).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-bold border-t border-slate-200 pt-3">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Supplier
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-emerald-600" /> Dispatch in 24 hrs
                  </span>
                </div>

                {/* Expandable Product Description */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 font-heading">Product Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {viewDetailProduct.description || "High-quality, trending e-commerce product sourced directly from verified manufacturers. Designed for high conversion rates on Meta Ads campaigns and seamless 1-click Shopify store integration."}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* PUSH TO SHOPIFY MODAL */}
      {selectedProductForShopify && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">1-Click Store Catalog Push</span>
                <h3 className="font-extrabold text-base font-heading text-slate-900 line-clamp-1">{selectedProductForShopify.name}</h3>
              </div>
              <button onClick={() => setSelectedProductForShopify(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>

            {!pushedSuccess ? (
              <form onSubmit={handlePushToShopify} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>360 Dropship Base Cost:</span>
                    <span className="font-bold text-slate-900">₹{selectedProductForShopify.wholesalePrice + selectedProductForShopify.shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>5% Agency Fee (Delivered):</span>
                    <span className="font-bold text-slate-900">₹{(customMarkupPrice * 0.05).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-cyan-600 font-extrabold text-sm">
                    <span>Your Net Margin / Sale:</span>
                    <span>₹{(customMarkupPrice - (selectedProductForShopify.wholesalePrice + selectedProductForShopify.shippingFee) - (customMarkupPrice * 0.05)).toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Set Your Selling Price on Shopify (₹) *</label>
                  <input
                    type="number"
                    required
                    min={selectedProductForShopify.wholesalePrice + selectedProductForShopify.shippingFee + 50}
                    value={customMarkupPrice}
                    onChange={(e) => setCustomMarkupPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForShopify(null)}
                    className="btn-secondary text-xs flex-1 py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs flex-1 py-3 font-extrabold shadow-md shadow-blue-600/30"
                  >
                    Push to Shopify Store ✓
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-lg font-heading text-slate-900">Product Successfully Pushed to Shopify!</h4>
                <p className="text-xs text-slate-600">
                  Item is now live on your Shopify store at ₹{customMarkupPrice}. Automated order sync active for warehouse dispatch.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFIT CALCULATOR MODAL */}
      <ProfitCalculatorModal
        isOpen={Boolean(profitCalcProduct)}
        onClose={() => setProfitCalcProduct(null)}
        product={profitCalcProduct}
        onPushToShopify={(prod) => {
          setSelectedProductForShopify(prod);
          setCustomMarkupPrice(prod.suggestedMrp);
        }}
      />

    </div>
  );
}
