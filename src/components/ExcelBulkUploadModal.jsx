import React, { useState } from 'react';
import { 
  X, Upload, Download, CheckCircle2, AlertCircle, 
  RefreshCw, Globe, Link2, Sparkles
} from 'lucide-react';

export default function ExcelBulkUploadModal({ isOpen, onClose, onBulkUploadSuccess }) {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://script.google.com/macros/s/AKfycbwfljG3mY5G3vn9_nGWQCfqZUyz1V44n23uHWPsmdsWCClPLfZGJMJ_ZF5seW0zSgzxQA/exec');
  
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Robust CSV parser supporting quotes, commas, multiline text & 2-3 images
  const parseCSV = (text) => {
    if (!text || typeof text !== 'string') return [];

    const lines = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentLine += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) lines.push(currentLine);

    if (lines.length < 2) return [];

    const parseLine = (line) => {
      const result = [];
      let start = 0;
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQ = !inQ;
        } else if (line[i] === ',' && !inQ) {
          result.push(line.substring(start, i).replace(/^"|"$/g, '').trim());
          start = i + 1;
        }
      }
      result.push(line.substring(start).replace(/^"|"$/g, '').trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());

    const findIndex = (keys) => {
      return headers.findIndex(h => keys.some(k => h.includes(k)));
    };

    const idxTitle = findIndex(['title', 'name', 'product name', 'item name', 'product']);
    const idxCost = findIndex(['cost per item', 'wholesale cost', 'wholesale price', 'wholesale', 'cost', 'app price']);
    const idxPrice = findIndex(['variant price', 'suggested mrp', 'selling price', 'price', 'mrp', 'retail price']);
    const idxSku = findIndex(['variant sku', 'sku', 'product code', 'code']);
    const idxImage = findIndex(['image src', 'image url', 'image', 'photo', 'picture']);
    const idxBody = findIndex(['body (html)', 'description', 'body', 'details']);
    const idxType = findIndex(['type', 'category', 'cat', 'vendor', 'department', 'group']);

    const parsedProducts = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (!row || row.length === 0) continue;

      let title = idxTitle !== -1 && row[idxTitle] ? row[idxTitle] : (row[1] || row[0]);
      if (!title || title.toLowerCase() === 'title' || title.toLowerCase() === 'name') continue;

      let rawCost = idxCost !== -1 && row[idxCost] ? row[idxCost] : (row[2] || '350');
      let costVal = parseFloat(rawCost.replace(/[^0-9.]/g, ''));
      if (isNaN(costVal) || costVal <= 0) costVal = 350;

      let rawPrice = idxPrice !== -1 && row[idxPrice] ? row[idxPrice] : (row[4] || row[3] || '1299');
      let priceVal = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
      if (isNaN(priceVal) || priceVal <= 0) priceVal = costVal + 600;

      let skuVal = idxSku !== -1 && row[idxSku] ? row[idxSku] : `SKU-GS-${Date.now()}-${i}`;

      const extractedImages = [];
      row.forEach(cell => {
        if (cell && typeof cell === 'string' && cell.startsWith('http')) {
          const urls = cell.split(/[\s,]+/).filter(u => u.startsWith('http'));
          urls.forEach(u => {
            if (!extractedImages.includes(u)) extractedImages.push(u);
          });
        }
      });

      const primaryImage = extractedImages[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";
      if (extractedImages.length === 0) extractedImages.push(primaryImage);

      let descVal = idxBody !== -1 && row[idxBody] ? row[idxBody] : "Imported wholesale product.";
      let typeVal = idxType !== -1 && row[idxType] ? row[idxType] : '';

      if (!typeVal) {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('watch') || lowerTitle.includes('headphone') || lowerTitle.includes('cam') || lowerTitle.includes('led') || lowerTitle.includes('usb') || lowerTitle.includes('phone')) {
          typeVal = 'Electronics';
        } else if (lowerTitle.includes('brass') || lowerTitle.includes('ganesha') || lowerTitle.includes('idol') || lowerTitle.includes('pooja') || lowerTitle.includes('god')) {
          typeVal = 'Religious & Ceremonial';
        } else if (lowerTitle.includes('kitchen') || lowerTitle.includes('pan') || lowerTitle.includes('pot') || lowerTitle.includes('cook') || lowerTitle.includes('bottle')) {
          typeVal = 'Home & Kitchenware';
        } else if (lowerTitle.includes('bag') || lowerTitle.includes('duffle') || lowerTitle.includes('luggage') || lowerTitle.includes('backpack')) {
          typeVal = 'Luggage & Bags';
        } else if (lowerTitle.includes('chair') || lowerTitle.includes('office') || lowerTitle.includes('desk')) {
          typeVal = 'Office Supplies';
        } else if (lowerTitle.includes('dog') || lowerTitle.includes('cat') || lowerTitle.includes('pet')) {
          typeVal = 'Animals & Pet Supplies';
        } else {
          typeVal = 'General Catalog';
        }
      }

      parsedProducts.push({
        id: `PROD-GS-${Date.now()}-${i}`,
        name: title,
        category: typeVal,
        wholesalePrice: costVal,
        shippingFee: 75,
        suggestedMrp: priceVal,
        stock: 500,
        rating: 4.8,
        image: primaryImage,
        images: extractedImages,
        sku: skuVal,
        description: descVal
      });
    }

    return parsedProducts;
  };

  // DIRECT SINGLE SYNC HANDLER (Supports WebApp Exec URLs, Deployment IDs, & Google Sheet Links)
  const handleDirectSync = async (e) => {
    e.preventDefault();
    if (!googleSheetUrl) return;

    setSyncing(true);
    setProgress(20);
    setErrorMessage('');

    try {
      let rawInput = googleSheetUrl.trim();
      let execUrl = rawInput;

      if (!rawInput.includes('http') && rawInput.startsWith('AKfycb')) {
        execUrl = `https://script.google.com/macros/s/${rawInput}/exec`;
      }

      // If standard Google Sheet link is provided, convert to CSV export URL
      if (rawInput.includes('docs.google.com/spreadsheets/d/')) {
        const match = rawInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          const sheetId = match[1];
          execUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        }
      }

      setProgress(40);

      // Try direct fetch first for Google Apps Script WebApps, then proxy fallbacks
      const proxies = [
        execUrl,
        `https://corsproxy.io/?${encodeURIComponent(execUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(execUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(execUrl)}`
      ];

      let rawData = null;
      let fetchSuccess = false;

      for (const endpoint of proxies) {
        try {
          const res = await fetch(endpoint, { redirect: 'follow' });
          if (res.ok) {
            const text = await res.text();
            if (text && text.length > 5 && !text.includes('Cloudflare') && !text.includes('Attention Required')) {
              try {
                rawData = JSON.parse(text);
              } catch (e) {
                rawData = text;
              }
              fetchSuccess = true;
              break;
            }
          }
        } catch (err) {
          console.warn('Fetch attempt failed for endpoint:', endpoint);
        }
      }

      setProgress(70);

      let productsParsed = [];
      if (rawData) {
        if (Array.isArray(rawData)) {
          productsParsed = rawData;
        } else if (rawData && Array.isArray(rawData.products)) {
          productsParsed = rawData.products;
        } else if (typeof rawData === 'string') {
          productsParsed = parseCSV(rawData);
        }
      }

      if (!fetchSuccess || productsParsed.length === 0) {
        throw new Error('Could not fetch products. If using Google Sheet, make sure Sharing is set to "Anyone with the link can view". If using Apps Script WebApp, make sure "Who has access" is set to "Anyone".');
      }

      // Standardize parsed product objects
      const formatted = productsParsed.map((p, i) => ({
        id: p.id || `PROD-GS-${Date.now()}-${i}`,
        name: p.name || p.title || `Product #${i + 1}`,
        category: p.category || p.type || 'General Catalog',
        wholesalePrice: parseFloat(p.wholesalePrice || p.cost || 350),
        shippingFee: 75,
        suggestedMrp: parseFloat(p.suggestedMrp || p.price || 1299),
        stock: 500,
        rating: 4.8,
        image: p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"),
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image].filter(Boolean),
        sku: p.sku || `SKU-GS-${Date.now()}-${i}`,
        description: p.description || "Imported product."
      }));

      setProgress(100);
      setSyncing(false);
      setUploadSuccess(true);
      setImportedCount(formatted.length);
      if (onBulkUploadSuccess) onBulkUploadSuccess(formatted);
    } catch (err) {
      console.error('Direct Sync Error:', err);
      setSyncing(false);
      setErrorMessage(err.message || 'Failed to fetch Google Sheet data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3" /> DIRECT GOOGLE SHEET & WEBAPP SYNC
            </span>
            <h3 className="text-xl font-extrabold font-heading mt-1">
              Google Sheet Product Importer
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!uploadSuccess ? (
            <form onSubmit={handleDirectSync} className="space-y-5">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-700 font-extrabold">
                  <Globe className="w-4 h-4" />
                  <span>Sync Titles, 2-3 Images, Costs & MRPs Live</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Paste your <strong>Google Sheet Link</strong> or <strong>Apps Script WebApp URL</strong> below to import all catalog items directly into your site!
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Google Sheet URL / Apps Script WebApp Link *
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/... OR WebApp URL"
                    className="w-full px-4 pl-10 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Columns Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-900 block">Sheet Column Order:</span>
                <p className="font-mono text-slate-700">Title | Category | Wholesale Cost | Suggested MRP | SKU | Image 1 | Image 2 | Image 3 | Description</p>
              </div>

              {syncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-600">
                    <span>Syncing products from Google Sheet...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary text-xs flex-1 py-3">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!googleSheetUrl || syncing}
                  className="btn-primary text-xs flex-1 py-3.5 font-extrabold justify-center shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {syncing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Syncing Products...</>
                  ) : (
                    '⚡ Connect & Sync Catalog →'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-xl font-heading text-slate-900 font-heading">Catalog Connected & Synced!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Successfully extracted and published <strong>{importedCount} products</strong> with exact titles, prices, SKUs, and 2-3 image URLs directly to your live catalog!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs font-extrabold py-3 px-6 rounded-xl shadow-md shadow-blue-600/30"
              >
                View Catalog Items ✓
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
