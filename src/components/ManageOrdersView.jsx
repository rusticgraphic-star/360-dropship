import React, { useState } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle2, Clock, RotateCcw, Search, Eye, Filter, ArrowUpRight } from 'lucide-react';

export default function ManageOrdersView({ orders }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated Warehouse Dispatch</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
          Manage Orders & Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Real-time status tracking for customer orders placed via your Shopify store or storefront.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'Delivered', 'Dispatched', 'Processing', 'Pending', 'RTO'].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">360 Cost</th>
                <th className="p-4">Net Profit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => {
                const baseCost = order.wholesaleCost + order.shippingFee;
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold font-mono text-slate-900">{order.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[11px] text-slate-500">{order.customerCity}</p>
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate">{order.productName}</td>
                    <td className="p-4 font-extrabold text-slate-900">₹{order.sellingPrice}</td>
                    <td className="p-4 text-rose-600 font-bold">-₹{baseCost}</td>
                    <td className="p-4 font-black text-cyan-600">₹{order.netProfit.toFixed(0)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg"
                      >
                        View Breakdown
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Breakdown Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-lg font-heading text-slate-900">{selectedOrder.id} Breakdown</h3>
                <p className="text-xs text-slate-500">{selectedOrder.date} • {selectedOrder.paymentMode}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Customer Selling Price:</span>
                <span className="font-bold text-slate-900">₹{selectedOrder.sellingPrice}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- Supplier Wholesale Cost:</span>
                <span className="font-semibold">-₹{selectedOrder.wholesaleCost}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- Flat Courier Shipping Charge:</span>
                <span className="font-semibold">-₹{selectedOrder.shippingFee}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>- 5% Agency Ad Service Fee:</span>
                <span className="font-semibold">-₹{selectedOrder.agencyFee5Percent.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-cyan-600 font-extrabold text-sm">
                <span>= Net Dropshipper Profit:</span>
                <span>₹{selectedOrder.netProfit.toFixed(1)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono">
              AWB Tracking ID: <span className="text-blue-600 font-bold">{selectedOrder.trackingId}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-primary text-xs font-bold w-full justify-center py-3 rounded-xl"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
