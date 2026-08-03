import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle2, Clock, RotateCcw, Search, Eye, Filter, ArrowUpRight, RefreshCw, ExternalLink, AlertCircle, Store, AlertTriangle, Send, X } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function ManageOrdersView({ orders, user }) {
  const currentUser = user || dbService.getCurrentUser();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shopifyOrders, setShopifyOrders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [viewMode, setViewMode] = useState('shopify');

  // NDR Re-attempt Modal State
  const [ndrModalOrder, setNdrModalOrder] = useState(null);
  const [ndrInstructions, setNdrInstructions] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [ndrSubmittedMsg, setNdrSubmittedMsg] = useState(false);

  // Auto-sync on mount if connected
  useEffect(() => {
    const stores = currentUser?.id ? dbService.getUserShopifyStores(currentUser.id) : [];
    const legacyShopify = currentUser?.id ? dbService.getUserShopify(currentUser.id) : null;
    const hasConnection = stores.length > 0 || (legacyShopify && legacyShopify.isConnected);
    if (hasConnection) {
      handleSyncOrders();
    }
  }, [currentUser?.id]);

  const handleSyncOrders = async () => {
    const stores = currentUser?.id ? dbService.getUserShopifyStores(currentUser.id) : [];
    const legacyShopify = currentUser?.id ? dbService.getUserShopify(currentUser.id) : null;
    
    let targetStores = stores.length > 0 ? stores : (legacyShopify?.domain ? [legacyShopify] : []);

    if (targetStores.length === 0) {
      setSyncError('No Shopify store connected. Go to Shopify Store Sync to connect your store first.');
      return;
    }

    setIsSyncing(true);
    setSyncError('');

    try {
      let combinedOrders = [];
      let syncErrors = [];

      for (const store of targetStores) {
        try {
          const response = await fetch('/api/shopify/pull-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shop: store.domain,
              token: store.token,
              status: 'any',
              limit: 50,
            })
          });

          const rawText = await response.text();
          let data = {};
          try { data = JSON.parse(rawText); } catch (e) {}

          if (data.success && data.orders) {
            const storeTaggedOrders = data.orders.map(ord => ({
              ...ord,
              storeDomain: store.domain,
            }));
            combinedOrders = [...combinedOrders, ...storeTaggedOrders];
          } else if (data.error) {
            syncErrors.push(`${store.domain}: ${data.error}`);
          }
        } catch (e) {
          syncErrors.push(`${store.domain}: ${e.message}`);
        }
      }

      if (combinedOrders.length > 0 || syncErrors.length === 0) {
        combinedOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setShopifyOrders(combinedOrders);
        dbService.saveUserOrders(currentUser?.id, combinedOrders);
        setLastSyncTime(new Date().toLocaleTimeString());
        setViewMode('shopify');
      }

      if (syncErrors.length > 0 && combinedOrders.length === 0) {
        setSyncError(syncErrors.join(' | '));
      }
    } catch (e) {
      setSyncError(e.message || 'Failed to sync orders from Shopify');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNdrSubmit = (e) => {
    e.preventDefault();
    if (ndrModalOrder && currentUser?.id && dbService.submitNdrAction) {
      dbService.submitNdrAction(currentUser.id, ndrModalOrder.id || ndrModalOrder.order_number, ndrInstructions, altPhone);
      setNdrSubmittedMsg(true);
      setTimeout(() => {
        setNdrSubmittedMsg(false);
        setNdrModalOrder(null);
        setNdrInstructions('');
        setAltPhone('');
        handleSyncOrders();
      }, 2000);
    }
  };

  const displayOrders = viewMode === 'shopify' && shopifyOrders.length > 0 ? shopifyOrders : (orders || []);

  const filteredOrders = displayOrders.filter(order => {
    const status = (order.fulfillmentStatus || order.status || '').toUpperCase();
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DELIVERED') return status === 'DELIVERED' || status === 'FULFILLED';
    if (activeFilter === 'IN_TRANSIT') return status === 'IN-TRANSIT' || status === 'SHIPPED' || status === 'IN_TRANSIT';
    if (activeFilter === 'NDR') return status === 'NDR' || status === 'ATTEMPTED';
    if (activeFilter === 'RTO') return status === 'RTO' || status === 'RETURNED';
    return true;
  });

  const getStatusBadge = (status) => {
    const upper = (status || '').toUpperCase();
    if (upper === 'DELIVERED' || upper === 'FULFILLED') {
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered (Profit Cleared)' };
    }
    if (upper === 'NDR' || upper === 'ATTEMPTED') {
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', label: '🚨 NDR (Action Required)' };
    }
    if (upper === 'RTO' || upper === 'RETURNED') {
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: '⚠️ RTO (Returned)' };
    }
    return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: '🚚 In-Transit' };
  };

  const getPaymentBadge = (status) => {
    const upper = (status || '').toUpperCase();
    if (upper === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (upper === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const ndrCount = displayOrders.filter(o => (o.fulfillmentStatus || o.status || '').toUpperCase().includes('NDR')).length;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Automated Order Engine</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-0.5">
            Manage Store Orders & Courier Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track real-time AWB courier status (Delivered, NDR & RTO) from Roposo Clout.
          </p>
        </div>

        <button
          onClick={handleSyncOrders}
          disabled={isSyncing}
          className="btn-primary text-xs font-extrabold py-3 px-5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Shopify...' : 'Sync Latest Orders'}</span>
        </button>
      </div>

      {/* NDR Urgent Alert Banner */}
      {ndrCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0 border border-rose-200">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-rose-900 text-sm font-heading">
                🚨 ACTION REQUIRED: {ndrCount} Order{ndrCount > 1 ? 's' : ''} in NDR (Non-Delivery / Customer Unreachable)
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Submit delivery re-attempt instructions & alternate customer phone number to prevent RTO courier returns!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter('NDR')}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shrink-0"
          >
            View NDR Orders →
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'IN_TRANSIT', 'DELIVERED', 'NDR', 'RTO'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              activeFilter === filter
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filter === 'ALL' ? 'All Orders' : filter === 'IN_TRANSIT' ? '🚚 In-Transit' : filter === 'DELIVERED' ? '● Delivered' : filter === 'NDR' ? '🚨 NDR Desk' : '⚠️ RTO Returned'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Name & Phone</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">AWB Courier Code</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.fulfillmentStatus || order.status);
                  const isNdr = (order.fulfillmentStatus || order.status || '').toUpperCase().includes('NDR');

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold font-mono text-blue-600">
                        {order.name || order.order_number || `#${order.id}`}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{order.customerName || order.customer_name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {order.phone || order.shipping_address?.phone || ''}
                        </p>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate">
                        {order.productName || order.line_items?.[0]?.title || 'Dropship Product'}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-600">
                        ₹{order.totalPrice || order.sellingPrice || order.total_price || '999'}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {order.awbCode ? (
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {order.awbCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Pending AWB</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isNdr && (
                            <button
                              onClick={() => setNdrModalOrder(order)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-sm"
                            >
                              🚨 Re-attempt NDR
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg"
                          >
                            Details
                          </button>
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
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">No Orders Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Click "Sync Latest Orders" to pull orders from your connected Shopify stores.
          </p>
        </div>
      )}

      {/* NDR RE-ATTEMPT SUBMISSION MODAL */}
      {ndrModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="bg-gradient-to-r from-rose-900 to-slate-950 p-6 text-white flex justify-between items-center">
              <div>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-rose-500/30">
                  NDR COURIER RE-ATTEMPT DESK
                </span>
                <h3 className="text-lg font-extrabold font-heading mt-1 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300" /> Submit NDR Action
                </h3>
              </div>
              <button onClick={() => setNdrModalOrder(null)} className="text-slate-400 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNdrSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alternate Customer Contact Number
                </label>
                <input
                  type="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Courier Delivery Re-Attempt Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={ndrInstructions}
                  onChange={(e) => setNdrInstructions(e.target.value)}
                  placeholder="e.g. Customer confirmed home available tomorrow after 3 PM. Please re-attempt delivery."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              {ndrSubmittedMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>NDR Re-attempt instructions saved & forwarded to Admin/Courier!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit NDR Instruction to Roposo →
                </button>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
