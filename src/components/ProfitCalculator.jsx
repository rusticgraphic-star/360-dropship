import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ProfitCalculator({ onOpenAuth }) {
  const [dailyOrders, setDailyOrders] = useState(10);
  const [wholesaleCost, setWholesaleCost] = useState(250);
  const [sellingPrice, setSellingPrice] = useState(999);
  const [adCostPerOrder, setAdCostPerOrder] = useState(150);

  const shippingFee = 45;
  const rtoFee = 30;
  const agencyFeePercent = 0.05;

  const agencyFeePerOrder = sellingPrice * agencyFeePercent;
  const netProfitPerOrder = sellingPrice - wholesaleCost - shippingFee - rtoFee - adCostPerOrder - agencyFeePerOrder;

  const monthlyOrders = dailyOrders * 30;
  const monthlyRevenue = monthlyOrders * sellingPrice;
  const monthlyNetProfit = Math.max(0, monthlyOrders * netProfitPerOrder);

  return (
    <section id="calculator" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-4 h-4 text-blue-600" /> Complete Financial Profit Model
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-heading text-slate-900">
            Calculate Your <span className="text-blue-600">Monthly Net Profit</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Real-time profit breakdown including Wholesale Product Cost, Shipping, RTO Reserve, Meta Ad Cost (CAC), and 5% Agency Fee.
          </p>
        </div>

        {/* Calculator Main Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Sliders Control Panel */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            
            <div className="space-y-6">
              
              {/* Slider 1: Daily Orders */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Daily Orders</label>
                  <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    {dailyOrders} Orders/day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={dailyOrders}
                  onChange={(e) => setDailyOrders(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-bold">
                  <span>1 order</span>
                  <span>50 orders</span>
                  <span>100 orders/day</span>
                </div>
              </div>

              {/* Slider 2: Wholesale Product Cost */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Supplier Wholesale Cost</label>
                  <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    ₹{wholesaleCost}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="10"
                  value={wholesaleCost}
                  onChange={(e) => setWholesaleCost(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Slider 3: Selling Price on Store */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Selling Price on Store</label>
                  <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    ₹{sellingPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="20"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Slider 4: Estimated Meta Ad Cost (CAC) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated Meta Ad Cost / Order (CAC)</label>
                  <span className="text-sm font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    ₹{adCostPerOrder}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={adCostPerOrder}
                  onChange={(e) => setAdCostPerOrder(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

            </div>

            {/* Comprehensive Line Item Breakdown */}
            <div className="border-t border-slate-200 pt-4 mt-6 space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Customer Selling Price:</span>
                <span className="font-bold text-slate-900">₹{sellingPrice}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- Wholesale Product Cost:</span>
                <span className="font-semibold">-₹{wholesaleCost}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- Shipping Courier Charge:</span>
                <span className="font-semibold">-₹{shippingFee}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- RTO Reserve Charge:</span>
                <span className="font-semibold">-₹{rtoFee}</span>
              </div>
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>- Estimated Meta Ad Cost (CAC):</span>
                <span>-₹{adCostPerOrder}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>- 5% Agency Management Fee:</span>
                <span className="font-semibold">-₹{agencyFeePerOrder.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-600 font-extrabold text-sm">
                <span>= Net Profit Per Order:</span>
                <span>₹{netProfitPerOrder.toFixed(1)}</span>
              </div>
            </div>

          </div>

          {/* Results Summary Box - Royal Blue Gradient */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between">
            
            <div>
              <span className="text-blue-100 font-extrabold text-xs uppercase tracking-wider block mb-2">Estimated Monthly Net Profit</span>
              <div className="text-4xl sm:text-5xl font-black mb-6 font-heading tracking-tight text-white">
                ₹{monthlyNetProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-base font-normal text-blue-200"> /month</span>
              </div>

              <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 mb-6 space-y-2.5 border border-white/10 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 font-medium">Monthly Orders:</span>
                  <span className="font-extrabold text-white">{monthlyOrders} Orders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 font-medium">Monthly Turnover:</span>
                  <span className="font-extrabold text-white">₹{monthlyRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-2">
                  <span className="text-blue-100 font-medium">Payout Method:</span>
                  <span className="font-extrabold text-cyan-300">Direct Bank Payout</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full bg-white text-slate-950 font-black py-3.5 px-6 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                Start Earning Now <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
              <p className="text-center text-[11px] text-blue-200 mt-3 font-medium">
                Zero Inventory • Setup Store in 30 Min
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
