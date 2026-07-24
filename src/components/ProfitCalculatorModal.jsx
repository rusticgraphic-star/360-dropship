import React, { useState } from 'react';
import { X, Calculator, RefreshCw, ShoppingBag, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function ProfitCalculatorModal({ isOpen, onClose, product, onPushToShopify }) {
  if (!isOpen || !product) return null;

  const appPrice = product.wholesalePrice + product.shippingFee;
  const rtoCharge = 75;

  // Form Inputs
  const [sellingPrice, setSellingPrice] = useState(product.suggestedMrp || 1499);
  const [expectedOrders, setExpectedOrders] = useState(100);
  const [confirmPercent, setConfirmPercent] = useState(70);
  const [deliveryPercent, setDeliveryPercent] = useState(80);
  const [adSpendPerOrder, setAdSpendPerOrder] = useState(250);
  const [miscCharges, setMiscCharges] = useState(500);

  // Accordion States
  const [showOrdersBreakdown, setShowOrdersBreakdown] = useState(true);
  const [showSpendsBreakdown, setShowSpendsBreakdown] = useState(true);

  // Calculations
  const numExpected = Number(expectedOrders) || 0;
  const numSellingPrice = Number(sellingPrice) || 0;
  const numConfirmPct = Number(confirmPercent) || 0;
  const numDeliveryPct = Number(deliveryPercent) || 0;
  const numAdSpend = Number(adSpendPerOrder) || 0;
  const numMisc = Number(miscCharges) || 0;

  // Order Funnel Counts
  const confirmedOrders = Math.round((numExpected * numConfirmPct) / 100);
  const deliveredOrders = Math.round((confirmedOrders * numDeliveryPct) / 100);
  const rtoOrders = Math.max(0, confirmedOrders - deliveredOrders);
  const cancelledOrders = Math.max(0, numExpected - confirmedOrders);

  // Financial Metrics
  const marginPerOrder = Math.max(0, numSellingPrice - appPrice);
  const totalEarnings = marginPerOrder * deliveredOrders;

  // Spends
  const totalAdSpends = numAdSpend * numExpected;
  const totalRtoCharges = rtoOrders * rtoCharge;
  const totalSpends = totalAdSpends + totalRtoCharges + numMisc;

  // Net Profit & ROI
  const netProfit = totalEarnings - totalSpends;
  const netProfitPerOrder = numExpected > 0 ? (netProfit / numExpected).toFixed(0) : 0;
  const roi = totalSpends > 0 ? ((netProfit / totalSpends) * 100).toFixed(1) : 0;

  const handleReset = () => {
    setSellingPrice(product.suggestedMrp || 1499);
    setExpectedOrders(100);
    setConfirmPercent(70);
    setDeliveryPercent(80);
    setAdSpendPerOrder(250);
    setMiscCharges(500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-5xl w-full text-slate-900 shadow-2xl overflow-hidden animate-fade-in my-auto">
        
        {/* TOP BAR */}
        <div className="p-4 sm:p-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900">
                Profit Calculator
              </h3>
              <p className="text-xs text-slate-500">Simulate order funnel, ad spends, RTO loss & net ROI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRODUCT SUMMARY STRIP */}
        <div className="bg-purple-50/60 border-b border-purple-200 p-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-purple-200 shadow-xs"
            />
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">App Price</span>
                <span className="font-extrabold text-purple-700 text-sm font-heading">₹{appPrice}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">RTO / Return</span>
                <span className="font-extrabold text-rose-600 text-sm font-heading">₹{rtoCharge}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Weight</span>
                <span className="font-extrabold text-slate-900 text-sm font-heading">450g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">SKU Code</span>
                <span className="font-mono font-extrabold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-purple-200">{product.sku}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { onClose(); onPushToShopify(product); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" /> Push to Shopify
          </button>
        </div>

        {/* MAIN BODY: LEFT INPUT FORM & RIGHT RESULTS GRID */}
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[calc(85vh-160px)] overflow-y-auto no-scrollbar">
          
          {/* LEFT COLUMN: INTERACTIVE PARAMETERS FORM */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Orders *</label>
                <input
                  type="number"
                  value={expectedOrders}
                  onChange={(e) => setExpectedOrders(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Orders (%) *</label>
                <input
                  type="number"
                  value={confirmPercent}
                  onChange={(e) => setConfirmPercent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Delivery (%) *</label>
                <input
                  type="number"
                  value={deliveryPercent}
                  onChange={(e) => setDeliveryPercent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad Spends / Order (₹) *</label>
                <input
                  type="number"
                  value={adSpendPerOrder}
                  onChange={(e) => setAdSpendPerOrder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Misc. Charges (₹)</label>
                <input
                  type="number"
                  value={miscCharges}
                  onChange={(e) => setMiscCharges(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-xs py-3 px-4 rounded-xl font-bold border border-slate-200 flex-1 justify-center"
              >
                Reset
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: CALCULATED RESULTS CARDS & ACCORDIONS */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. TOTAL EARNINGS CARD (GREEN BOX) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-emerald-800 text-base font-heading">Total Earnings</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">Margin per Order × Delivered Orders</p>
                </div>
                <span className="text-3xl font-black text-emerald-600 font-heading">
                  ₹{totalEarnings.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80 text-xs font-medium text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Margin per Order</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{numSellingPrice} - ₹{appPrice} = <strong className="text-emerald-700">₹{marginPerOrder}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivered Orders</span>
                  <span className="font-extrabold text-slate-900">
                    {confirmedOrders} × {numDeliveryPct}% = <strong className="text-emerald-700">{deliveredOrders}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. NET PROFIT CARD (ROSE BOX) */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h4 className="font-black text-rose-900 text-base font-heading">Net Profit</h4>
                <p className="text-[10px] text-rose-600 font-bold">Total Earnings - Total Spends</p>
                <p className="text-xs text-rose-700 font-extrabold mt-1">Per order: ₹{netProfitPerOrder}</p>
              </div>

              <span className={`text-3xl font-black font-heading ${netProfit >= 0 ? 'text-rose-600' : 'text-rose-700'}`}>
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 3. ROI CARD */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h4 className="font-black text-purple-900 text-base font-heading">ROI (Return on Investment)</h4>
                <p className="text-[10px] text-purple-600 font-bold">(Net Profit ÷ Total Spends) × 100</p>
              </div>

              <span className="text-3xl font-black text-purple-700 font-heading">
                {roi}%
              </span>
            </div>

            {/* ACCORDION 1: TOTAL ORDERS BREAKDOWN */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setShowOrdersBreakdown(!showOrdersBreakdown)}
                className="w-full p-4 text-left font-extrabold text-xs text-slate-900 flex justify-between items-center bg-slate-50 border-b border-slate-200"
              >
                <span>| Total Orders Breakdown</span>
                {showOrdersBreakdown ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showOrdersBreakdown && (
                <div className="p-4 space-y-2 text-xs font-medium text-slate-700 divide-y divide-slate-100">
                  <div className="flex justify-between pb-1">
                    <span>Expected Orders:</span>
                    <span className="font-bold text-slate-900">{numExpected}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-purple-700">
                    <span>Confirmed Orders (Expected × Confirm %):</span>
                    <span className="font-bold">{confirmedOrders}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-emerald-700 font-bold">
                    <span>Delivered Orders (Confirmed × Delivery %):</span>
                    <span>{deliveredOrders}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-rose-600 font-bold">
                    <span>RTO Orders (Confirmed - Delivered):</span>
                    <span>{rtoOrders}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-amber-600">
                    <span>Cancelled Orders (Expected - Confirmed):</span>
                    <span className="font-bold">{cancelledOrders}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: TOTAL SPENDS BREAKDOWN */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setShowSpendsBreakdown(!showSpendsBreakdown)}
                className="w-full p-4 text-left font-extrabold text-xs text-slate-900 flex justify-between items-center bg-slate-50 border-b border-slate-200"
              >
                <span>| Total Spends Breakdown</span>
                {showSpendsBreakdown ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showSpendsBreakdown && (
                <div className="p-4 space-y-2 text-xs font-medium text-slate-700 divide-y divide-slate-100">
                  <div className="flex justify-between pb-1">
                    <span>Total Ad Spends (Ad Spend/order × Expected orders):</span>
                    <span className="font-bold text-rose-600">₹{totalAdSpends.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Total RTO Charges (RTO Charges × RTO Orders):</span>
                    <span className="font-bold text-rose-600">₹{totalRtoCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Total Misc. Charges:</span>
                    <span className="font-bold text-slate-900">₹{numMisc.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-slate-900 font-extrabold text-sm border-t border-slate-200">
                    <span>Grand Total Spends:</span>
                    <span className="text-rose-600">₹{totalSpends.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
