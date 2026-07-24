import React, { useState } from 'react';
import { PlusCircle, Upload, CheckCircle2, Package } from 'lucide-react';

export default function SourceProductModal({ onAddCustomProduct }) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Home & Kitchenware');
  const [targetCost, setTargetCost] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName) return;

    onAddCustomProduct({
      id: `PROD-SRC-${Math.floor(100 + Math.random() * 900)}`,
      name: productName,
      category: category,
      wholesalePrice: Number(targetCost) || 350,
      shippingFee: 75,
      suggestedMrp: (Number(targetCost) || 350) + 500,
      stock: 500,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      sku: `SRC-${Math.floor(1000 + Math.random() * 9000)}`,
      description: "Custom factory sourced product requested by dropshipper."
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setProductName('');
      setTargetCost('');
      setReferenceUrl('');
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Custom Sourcing Request</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Source A Product
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Want to sell a product not in our catalog? Paste an Alibaba/Amazon link or product image, and our wholesale sourcing team will source it for you within 24 hours!
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Wireless Handheld Car Vacuum Cleaner"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Home & Kitchenware">Home & Kitchenware</option>
                <option value="Electronics">Electronics</option>
                <option value="Religious & Ceremonial">Religious & Ceremonial</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Luggage & Bags">Luggage & Bags</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Wholesale Cost (₹)</label>
              <input
                type="number"
                placeholder="e.g. 350"
                value={targetCost}
                onChange={(e) => setTargetCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reference URL (Amazon, IndiaMART, 1688, TikTok)</label>
            <input
              type="url"
              placeholder="https://..."
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sourcing request received! Product added to catalog preview.
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-md shadow-orange-500/20"
          >
            Submit Factory Sourcing Request
          </button>
        </form>
      </div>

    </div>
  );
}
