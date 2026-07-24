import React, { useState } from 'react';
import { 
  X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, 
  RefreshCw, ArrowRight, FileCheck, Globe, Link2, ExternalLink, Sparkles, Code, Zap
} from 'lucide-react';

export default function ExcelBulkUploadModal({ isOpen, onClose, onBulkUploadSuccess }) {
  const [activeTab, setActiveTab] = useState('webapp'); // 'webapp', 'gsheet', 'file', or 'script'
  const [webAppUrl, setWebAppUrl] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [file, setFile] = useState(null);
  
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Robust CSV parser supporting quotes, commas, and multiline text
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

  // WEBAPP EXEC URL HANDLER
  const handleWebAppSync = async (e) => {
    e.preventDefault();
    if (!webAppUrl) return;

    setSyncing(true);
    setProgress(20);
    setErrorMessage('');

    try {
      let rawInput = webAppUrl.trim();
      let execUrl = rawInput;
      if (!rawInput.includes('http')) {
        execUrl = `https://script.google.com/macros/s/${rawInput}/exec`;
      }

      setProgress(50);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(execUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Could not connect to Google Sheet WebApp URL.');
      
      const json = await res.json();
      let productsParsed = [];

      if (Array.isArray(json)) {
        productsParsed = json;
      } else if (json && Array.isArray(json.products)) {
        productsParsed = json.products;
      } else if (typeof json === 'string') {
        productsParsed = parseCSV(json);
      }

      if (productsParsed.length === 0) {
        throw new Error('WebApp returned 0 products. Make sure your Apps Script doGet() returns product data.');
      }

      const formatted = productsParsed.map((p, i) => ({
        id: p.id || `PROD-GS-${Date.now()}-${i}`,
        name: p.name || p.title || `Product #${i + 1}`,
        category: p.category || p.type || 'General Catalog',
        wholesalePrice: parseFloat(p.wholesalePrice || p.cost || 350),
        shippingFee: 75,
        suggestedMrp: parseFloat(p.suggestedMrp || p.price || 1299),
        stock: 500,
        rating: 4.8,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"),
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
      console.error('WebApp Sync Error:', err);
      setSyncing(false);
      setErrorMessage(err.message || 'Failed to fetch Google Sheet WebApp data.');
    }
  };

  // GOOGLE SHEETS LIVE SYNC HANDLER
  const handleGoogleSheetsSync = async (e) => {
    e.preventDefault();
    if (!googleSheetUrl) return;

    setSyncing(true);
    setProgress(20);
    setErrorMessage('');

    try {
      let rawInput = googleSheetUrl.trim();
      let csvUrl = rawInput;

      if (rawInput.includes('docs.google.com/spreadsheets/d/')) {
        const match = rawInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          const sheetId = match[1];
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        }
      }

      setProgress(40);
      
      let csvText = '';
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`,
        csvUrl
      ];

      for (const url of proxies) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (text && !text.includes('<!DOCTYPE html>') && text.length > 20) {
              csvText = text;
              break;
            }
          }
        } catch (e) {
          console.warn('Proxy fetch attempt failed, trying next...');
        }
      }

      setProgress(70);

      let productsParsed = parseCSV(csvText);

      if (productsParsed.length === 0) {
        throw new Error('Could not parse products from sheet. Make sure your Google Sheet is shared as "Anyone with the link can view".');
      }

      setProgress(100);
      setSyncing(false);
      setUploadSuccess(true);
      setImportedCount(productsParsed.length);
      if (onBulkUploadSuccess) {
        onBulkUploadSuccess(productsParsed);
      }
    } catch (err) {
      console.error('Google Sheet Sync Error:', err);
      setSyncing(false);
      setErrorMessage(err.message || 'Failed to fetch Google Sheet data.');
    }
  };

  // LOCAL FILE UPLOAD HANDLER
  const handleLocalFileStart = () => {
    if (!file) return;
    setSyncing(true);
    setProgress(20);

    const reader = new FileReader();
    reader.onload = (e) => {
      setProgress(60);
      const text = e.target.result;
      let productsParsed = parseCSV(text);

      if (productsParsed.length === 0) {
        setSyncing(false);
        setErrorMessage('No valid product rows found in the CSV file.');
        return;
      }

      setProgress(100);
      setSyncing(false);
      setUploadSuccess(true);
      setImportedCount(productsParsed.length);
      if (onBulkUploadSuccess) {
        onBulkUploadSuccess(productsParsed);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadShopifySample = () => {
    const csvHeader = "Title,Wholesale Cost,Suggested MRP,Variant SKU,Image Src,Category,Description\n";
    const sampleRow1 = "Smart Watch Ultra 2 AMOLED,450,1499,SW-ULT2-BLK,https://images.unsplash.com/photo-1579586337278-3befd40fd17a,Electronics,High definition AMOLED smartwatch\n";
    const sampleRow2 = "Pure Brass Lord Ganesha Idol,280,899,REL-GAN-BRS,https://images.unsplash.com/photo-1606293926075-69a00dbfde81,Religious & Ceremonial,Handcrafted antique finish solid brass Ganesha idol\n";

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + sampleRow1 + sampleRow2);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "360_GoogleSheets_Shopify_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleAppsScriptCode = `/**
 * 360 Dropship Network - Google Apps Script WebApp
 * Columns: Title (A), Category (B), Wholesale Cost (C), Suggested MRP (D), SKU (E), Image 1 (F), Image 2 (G), Image 3 (H), Description (I)
 */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var products = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // Skip empty rows

    products.push({
      name: row[0],
      category: row[1] || 'General Catalog',
      wholesalePrice: Number(row[2]) || 350,
      suggestedMrp: Number(row[3]) || 1299,
      sku: row[4] || ('SKU-GS-' + i),
      image: row[5] || '',
      images: [row[5], row[6], row[7]].filter(Boolean),
      description: row[8] || 'Imported product'
    });
  }

  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🚀 360 Dropship")
    .addItem("Sync Catalog to Website", "doGet")
    .addToUi();
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3" /> GOOGLE SHEET WEBAPP & CSV IMPORTER
            </span>
            <h3 className="text-xl font-extrabold font-heading mt-1">
              Google Sheet WebApp & CSV Sync
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('webapp'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'webapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" /> WebApp URL Sync
          </button>

          <button
            onClick={() => { setActiveTab('gsheet'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'gsheet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" /> Live Sheet URL
          </button>

          <button
            onClick={() => { setActiveTab('file'); setErrorMessage(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'file'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV File
          </button>

          <button
            onClick={() => { setActiveTab('script'); setErrorMessage(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'script'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4" /> Apps Script Code
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
            <>
              {/* TAB 1: GOOGLE APPS SCRIPT WEBAPP URL SYNC */}
              {activeTab === 'webapp' && (
                <form onSubmit={handleWebAppSync} className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Paste your Google Apps Script WebApp URL</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Paste the WebApp URL generated from Google Apps Script (<strong>Deploy &rarr; New deployment &rarr; Web app</strong>).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Google Sheet WebApp Exec URL / Deployment ID *
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={webAppUrl}
                        onChange={(e) => setWebAppUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        className="w-full px-4 pl-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {syncing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-emerald-700">
                        <span>Connecting to Google Sheet WebApp...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary text-xs flex-1 py-3">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!webAppUrl || syncing}
                      className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs flex-1 py-3.5 font-extrabold justify-center shadow-md shadow-emerald-600/30 disabled:opacity-50"
                    >
                      {syncing ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Fetching Products...</>
                      ) : (
                        '⚡ Sync WebApp Products →'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: GOOGLE SHEETS LIVE URL SYNC */}
              {activeTab === 'gsheet' && (
                <form onSubmit={handleGoogleSheetsSync} className="space-y-4">
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-blue-700 font-extrabold">
                      <Globe className="w-4 h-4" />
                      <span>Extract Titles, Images, Costs & MRPs from Google Sheet Link</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Paste any Google Sheet URL. Make sure sheet sharing is set to <strong>"Anyone with the link can view"</strong>!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Google Sheet Public Share Link *
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="url"
                        required
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
                        className="w-full px-4 pl-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {syncing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-blue-600">
                        <span>Extracting real product data from Google Sheet...</span>
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
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Extracting Data...</>
                      ) : (
                        '⚡ Sync Sheet Products →'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: LOCAL CSV FILE UPLOAD */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Google Sheet / Shopify CSV Template</h4>
                      <p className="text-[11px] text-slate-500">Exact column format download</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadShopifySample}
                      className="btn-secondary text-xs font-bold py-2 px-3 rounded-xl border border-blue-200 flex items-center gap-1 text-blue-700 bg-white hover:bg-blue-50"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Template
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center bg-slate-50/50 transition-all">
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls, .txt"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                      id="shopify-csv-file-input"
                    />
                    <label htmlFor="shopify-csv-file-input" className="cursor-pointer block space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {file ? <span className="text-blue-600 font-mono">{file.name}</span> : 'Click to select CSV file'}
                      </div>
                    </label>
                  </div>

                  {syncing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Parsing Local File...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary text-xs flex-1 py-3">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLocalFileStart}
                      disabled={!file || syncing}
                      className="btn-primary text-xs flex-1 py-3.5 font-extrabold justify-center shadow-md shadow-blue-600/30 disabled:opacity-50"
                    >
                      {syncing ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Importing...</>
                      ) : (
                        'Import CSV File →'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE APPS SCRIPT CODE */}
              {activeTab === 'script' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-2">
                    <h4 className="font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-purple-600" /> Google Apps Script WebApp Code
                    </h4>
                    <p className="text-slate-600">
                      Paste this script into <strong>Extensions &rarr; Apps Script</strong>, click <strong>Deploy &rarr; New deployment &rarr; Web app</strong>, and copy the WebApp URL into Tab 1!
                    </p>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto relative border border-slate-800">
                    <pre>{googleAppsScriptCode}</pre>
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(googleAppsScriptCode)}
                    className="btn-secondary text-xs w-full py-2.5 font-bold justify-center"
                  >
                    📋 Copy WebApp Apps Script Code
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-xl font-heading text-slate-900 font-heading">Exact Product Data Synced!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Successfully extracted and published <strong>{importedCount} products</strong> with exact titles, prices, SKUs, and image URLs directly to your catalog!
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
