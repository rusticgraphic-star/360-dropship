import React, { useState } from 'react';
import { 
  ShieldCheck, Upload, Landmark, Settings, Wallet, TrendingUp, Package, 
  Users, CheckCircle2, ArrowRight, DollarSign, RefreshCw, Key, FileSpreadsheet,
  Plus, Edit, Trash2, Check, X, BarChart3
} from 'lucide-react';

export default function AdminDashboard({ 
  agencyUpiId, 
  onSaveUpiId, 
  orders, 
  products, 
  onOpenBulkUpload,
  activeTab,
  onAddProduct,
  onEditProduct,
  onDeleteProducts
}) {
  const [upiIdInput, setUpiIdInput] = useState(agencyUpiId);
  const [upiSaved, setUpiSaved] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Admin Payout Request Approval Mock State
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'PAY-8821', sellerName: 'Rajesh Verma (TrendVibe)', amount: 18450, upiId: 'rajesh.verma@okaxis', date: '2026-07-24', status: 'Pending' },
    { id: 'PAY-8822', sellerName: 'Ananya Roy (GlowCraft)', amount: 9200, upiId: 'ananya@paytm', date: '2026-07-23', status: 'Approved', utr: 'UTR9948210492' }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [utrInput, setUtrInput] = useState('');

  // Add / Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    wholesalePrice: 450,
    shippingFee: 75,
    suggestedMrp: 1499,
    stock: 1000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80',
    description: ''
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Electronics',
      wholesalePrice: 450,
      shippingFee: 75,
      suggestedMrp: 1499,
      stock: 1000,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80',
      description: 'High-quality trending e-commerce product.'
    });
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      wholesalePrice: prod.wholesalePrice,
      shippingFee: prod.shippingFee || 75,
      suggestedMrp: prod.suggestedMrp,
      stock: prod.stock || 1000,
      image: prod.image,
      description: prod.description || 'High-quality trending product.'
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      if (onEditProduct) {
        onEditProduct({ ...editingProduct, ...productForm });
      }
    } else {
      const newProd = {
        id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 4.8,
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        ...productForm
      };
      if (onAddProduct) {
        onAddProduct(newProd);
      }
    }
    setProductModalOpen(false);
  };

  const handleApprovePayout = (e) => {
    e.preventDefault();
    if (selectedRequest && utrInput) {
      setPayoutRequests(prev => prev.map(p => p.id === selectedRequest.id ? { ...p, status: 'Approved', utr: utrInput } : p));
      setSelectedRequest(null);
      setUtrInput('');
    }
  };

  const handleSaveUpi = (e) => {
    e.preventDefault();
    onSaveUpiId(upiIdInput);
    setUpiSaved(true);
    setTimeout(() => setUpiSaved(false), 2500);
  };

  const currentTab = activeTab || 'payout-approvals';

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 max-w-7xl mx-auto">
      
      {/* Admin Top Header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-rose-600" /> Internal Agency Admin Command Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            360 Dropship Agency Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage product catalog, bulk upload 10k items, configure agency UPI receiver VPA, and release seller payouts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenAddModal}
            className="btn-primary py-3 px-5 text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
          
          <button
            onClick={onOpenBulkUpload}
            className="btn-secondary py-3 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Bulk Upload (.xlsx)
          </button>
        </div>
      </div>

      {/* ADMIN CONTENT BASED ON VERTICAL LEFT SIDEBAR MENU TAB */}
      
      {/* TAB 1: Payout Approval Desk */}
      {(currentTab === 'payout-approvals' || currentTab === 'admin-portal') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-heading">Dropshipper Bank & UPI Payout Approval Desk</h3>
              <p className="text-xs text-slate-500">Review pending profit withdrawal requests and input bank UTR transaction receipt.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              DIRECT BANK / UPI PAYOUT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3.5">Request ID</th>
                  <th className="p-3.5">Seller Name</th>
                  <th className="p-3.5">Requested Amount</th>
                  <th className="p-3.5">UPI VPA / Bank</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payoutRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{req.id}</td>
                    <td className="p-3.5 text-slate-800 font-bold">{req.sellerName}</td>
                    <td className="p-3.5 font-black text-emerald-600 text-sm">₹{req.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-cyan-600 font-mono font-bold">{req.upiId}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="btn-primary text-[11px] py-1.5 px-3 rounded-lg shadow-xs"
                        >
                          Approve Payout →
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono font-bold">
                          UTR: {req.utr}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Add & Edit Catalog Products */}
      {currentTab === 'admin-products' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg font-heading">Catalog Product Management</h3>
              <p className="text-xs text-slate-500">Add new products, import Shopify CSV exports, or bulk delete items.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {selectedProductIds.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
                      if (onDeleteProducts) onDeleteProducts(selectedProductIds);
                      setSelectedProductIds([]);
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected ({selectedProductIds.length})
                </button>
              )}

              <button
                onClick={onOpenBulkUpload}
                className="btn-secondary text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk CSV Import
              </button>

              <button
                onClick={handleOpenAddModal}
                className="btn-primary text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds(products.map(p => p.id));
                        } else {
                          setSelectedProductIds([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Product ID</th>
                  <th className="p-3.5">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Wholesale Cost</th>
                  <th className="p-3.5">Shipping Fee</th>
                  <th className="p-3.5">Suggested MRP</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  return (
                    <tr key={prod.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(prev => [...prev, prod.id]);
                            } else {
                              setSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{prod.id}</td>
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-3">
                        <img src={prod.image} alt={prod.name} className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-200" />
                        <span className="line-clamp-1 max-w-xs">{prod.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">{prod.category}</td>
                      <td className="p-3.5 font-extrabold text-blue-600">₹{prod.wholesalePrice}</td>
                      <td className="p-3.5 text-slate-500">₹{prod.shippingFee || 75}</td>
                      <td className="p-3.5 font-extrabold text-emerald-600">₹{prod.suggestedMrp}</td>
                      <td className="p-3.5 font-mono text-slate-700">{prod.stock || 1000}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="btn-secondary text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 inline-flex"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${prod.name}"?`)) {
                              if (onDeleteProducts) onDeleteProducts([prod.id]);
                              setSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                            }
                          }}
                          className="text-[11px] py-1 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 inline-flex font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Agency UPI Settings */}
      {currentTab === 'agency-settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg font-heading">Agency UPI Receiver VPA Settings</h3>
            <p className="text-xs text-slate-500">Configure the agency UPI ID used to generate Dynamic UPI QR Codes for dropshippers.</p>
          </div>

          <form onSubmit={handleSaveUpi} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Agency UPI Receiver VPA ID *</label>
              <input
                type="text"
                required
                value={upiIdInput}
                onChange={(e) => setUpiIdInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. agency.dropship@icici"
              />
              <p className="text-[11px] text-slate-500 mt-1">All dropshipper ad wallet top-ups will be credited to this UPI VPA ID.</p>
            </div>

            {upiSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                ✓ Agency UPI ID successfully updated to {agencyUpiId}!
              </div>
            )}

            <button
              type="submit"
              className="btn-primary text-xs font-extrabold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30"
            >
              Save Agency UPI Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Platform Analytics */}
      {currentTab === 'platform-analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Total Platform Revenue</span>
            <p className="text-3xl font-black text-slate-900 font-heading">₹2,84,900.00</p>
            <p className="text-xs text-blue-600 mt-1 font-bold">5% Agency service fee revenue</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Active Dropshippers</span>
            <p className="text-3xl font-black text-slate-900 font-heading">142 Sellers</p>
            <p className="text-xs text-emerald-600 mt-1 font-bold">KYC & Store Connected</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Catalog Inventory</span>
            <p className="text-3xl font-black text-slate-900 font-heading">{products.length} Items</p>
            <p className="text-xs text-blue-600 mt-1 font-bold">Ready to ship nationwide</p>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-lg font-heading text-slate-900">
                {editingProduct ? `Edit Product: ${editingProduct.id}` : 'Add New Product to Catalog'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Full product title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchenware">Home & Kitchenware</option>
                    <option value="Religious & Ceremonial">Religious & Ceremonial</option>
                    <option value="Cameras & Optics">Cameras & Optics</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Luggage & Bags">Luggage & Bags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Wholesale Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.wholesalePrice}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Flat Shipping Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.shippingFee}
                    onChange={(e) => setProductForm({ ...productForm, shippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Suggested MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.suggestedMrp}
                    onChange={(e) => setProductForm({ ...productForm, suggestedMrp: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="btn-secondary text-xs flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex-1 py-3 font-extrabold"
                >
                  {editingProduct ? 'Save Changes ✓' : 'Add to Catalog ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE PAYOUT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg font-heading">Approve Payout: {selectedRequest.id}</h3>
            <p className="text-xs text-slate-600">
              Releasing <strong>₹{selectedRequest.amount.toLocaleString('en-IN')}</strong> to <strong>{selectedRequest.upiId}</strong>.
            </p>

            <form onSubmit={handleApprovePayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Enter Bank UTR Transaction No. *</label>
                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. UTR994810294"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="btn-secondary text-xs flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex-1 py-3 font-extrabold"
                >
                  Confirm & Send Payout ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
