import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle2, Clock, RotateCcw, Search, Eye, Filter, ArrowUpRight, RefreshCw, ExternalLink, AlertCircle, Store } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ManageOrdersView({ orders, user }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shopifyOrders, setShopifyOrders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [viewMode, setViewMode] = useState('shopify'); // 'shopify' or 'local'

  // Auto-sync on mount if connected
  useEffect(() => {
    const shopifyData = user?.id ? dbService.getUserShopify(user.id) : null;
    if (shopifyData && shopifyData.isConnected && shopifyData.domain && shopifyData.token) {
      handleSyncOrders();
    }
  }, [user]);

  const handleSyncOrders = async () => {
    const shopifyData = user?.id ? dbService.getUserShopify(user.id) : null;
    if (!shopifyData || !shopifyData.isConnected || !shopifyData.domain || !shopifyData.token) {
      setSyncError('No Shopify store connected. Go to Shopify Store Sync to connect your store first.');
      return;
    }

    setIsSyncing(true);
    setSyncError('');

    try {
      const response = await fetch('/api/shopify/pull-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: shopifyData.domain,
          token: shopifyData.token,
          status: 'any',
          limit: 50,
        })
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        setSyncError('Invalid server response. Check your store connection.');
        return;
      }

      if (data.success) {
        setShopifyOrders(data.orders || []);
        setLastSyncTime(new Date().toLocaleTimeString());
        setViewMode('shopify');
      } else {
        setSyncError(data.error || 'Failed to fetch orders from Shopify.');
      }
    } catch (err) {
      setSyncError(`Network error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Combine orders based on viewMode
  const displayOrders = viewMode === 'shopify' ? shopifyOrders : orders;

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'fulfilled') return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Fulfilled' };
    if (statusLower === 'dispatched' || statusLower === 'partial') return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Partial' };
    if (statusLower === 'unfulfilled' || statusLower === 'pending') return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Unfulfilled' };
    if (statusLower === 'rto' || statusLower === 'cancelled') return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' };
    return { bg: 'bg-slate-50 text-slate-600 border-slate-200', label: status || 'Unknown' };
  };

  const getPaymentBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (statusLower === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (statusLower === 'refunded') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  // Filter orders
  const filteredOrders = viewMode === 'shopify'
    ? (activeFilter === 'ALL'
      ? shopifyOrders
      : shopifyOrders.filter(o => {
          const fs = (o.fulfillmentStatus || '').toLowerCase();
          const filterLower = activeFilter.toLowerCase();
          if (filterLower === 'fulfilled') return fs === 'fulfilled';
          if (filterLower === 'unfulfilled') return fs === 'unfulfilled' || fs === '';
          if (filterLower === 'paid') return (o.financialStatus || '').toLowerCase() === 'paid';
          return true;
        }))
    : (activeFilter === 'ALL' ? orders : orders.filter(o => o.status && o.status.toLowerCase() === activeFilter.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Live Shopify Integration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
            Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time orders synced from your connected Shopify store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="text-[10px] text-slate-500 font-mono">Last synced: {lastSyncTime}</span>
          )}
          <button
            onClick={handleSyncOrders}
            disabled={isSyncing}
            className="btn-primary text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Shopify'}
          </button>
        </div>
      </div>

      {/* Sync Error */}
      {syncError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'Unfulfilled', 'Fulfilled', 'Paid'].map((filter) => {
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

        <span className="ml-auto text-xs text-slate-500 font-bold">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.fulfillmentStatus || order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold font-mono text-blue-600">
                        {order.name || order.orderNumber || `#${order.id}`}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{order.customerName || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500">
                          {order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.province}` : (order.customerCity || '')}
                        </p>
                      </td>
                      <td className="p-4 text-slate-700">
                        {order.lineItems ? (
                          <div>
                            <p className="line-clamp-1">{order.lineItems[0]?.title || 'N/A'}</p>
                            {order.lineItems.length > 1 && (
                              <p className="text-[10px] text-slate-500">+{order.lineItems.length - 1} more</p>
                            )}
                          </div>
                        ) : (
                          <span>{order.productName || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        {order.currency === 'INR' || !order.currency ? '₹' : order.currency}{order.totalPrice || order.sellingPrice || '0'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadge(order.financialStatus || 'paid')}`}>
                          {order.financialStatus || 'paid'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : (order.date || 'N/A')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg"
                          >
                            Details
                          </button>
                          {order.adminUrl && (
                            <a
                              href={order.adminUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View in Shopify Admin"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">No Orders Yet</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              {isSyncing
                ? 'Syncing orders from your Shopify store...'
                : 'Connect your Shopify store and click "Sync from Shopify" to pull your latest orders.'}
            </p>
          </div>
          <button
            onClick={handleSyncOrders}
            disabled={isSyncing}
            className="btn-primary text-xs font-extrabold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30 inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Orders from Shopify'}
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-lg font-heading text-slate-900">
                  Order {selectedOrder.name || selectedOrder.orderNumber || `#${selectedOrder.id}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : (selectedOrder.date || '')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Customer Details</h4>
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-bold text-slate-900">{selectedOrder.customerName || 'N/A'}</span>
              </div>
              {selectedOrder.email && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.email}</span>
                </div>
              )}
              {selectedOrder.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Phone:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.phone}</span>
                </div>
              )}
              {selectedOrder.shippingAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Address:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[200px]">
                    {[selectedOrder.shippingAddress.address1, selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.province, selectedOrder.shippingAddress.zip].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Line Items */}
            {selectedOrder.lineItems && selectedOrder.lineItems.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Items Ordered</h4>
                {selectedOrder.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                      {item.variantTitle && <p className="text-[10px] text-slate-500">{item.variantTitle}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-slate-900">₹{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{selectedOrder.totalPrice || selectedOrder.sellingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadge(selectedOrder.financialStatus || 'paid')}`}>
                  {selectedOrder.financialStatus || 'paid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedOrder.fulfillmentStatus || selectedOrder.status).bg}`}>
                  {getStatusBadge(selectedOrder.fulfillmentStatus || selectedOrder.status).label}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedOrder.adminUrl && (
                <a
                  href={selectedOrder.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs font-bold flex-1 justify-center py-3 rounded-xl flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> View in Shopify Admin
                </a>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary text-xs font-bold flex-1 justify-center py-3 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
