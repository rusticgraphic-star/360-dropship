import React, { useState, useRef } from 'react';
import { 
  X, Upload, Download, CheckCircle2, AlertCircle, 
  RefreshCw, Globe, Link2, Sparkles, FileSpreadsheet, FileText, Copy
} from 'lucide-react';

export default function ExcelBulkUploadModal({ isOpen, onClose, onBulkUploadSuccess }) {
  const [activeUploadMethod, setActiveUploadMethod] = useState('url'); // 'url' | 'file' | 'paste'
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://script.google.com/macros/s/AKfycbwfljG3mY5G3vn9_nGWQCfqZUyz1V44n23uHWPsmdsWCClPLfZGJMJ_ZF5seW0zSgzxQA/exec');
  const [pastedText, setPastedText] = useState('');
  
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Ultra-flexible CSV & Delimited Text Parser supporting Comma, Tab, Semicolon, Quotes & 2-3 Multi-Images
  const parseRawDelimitedText = (text) => {
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

    if (lines.length === 0) return [];

    // Determine delimiter (comma, tab, semicolon)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line) => {
      const result = [];
      let start = 0;
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQ = !inQ;
        } else if (line[i] === delimiter && !inQ) {
          result.push(line.substring(start, i).replace(/^"|"$/g, '').trim());
          start = i + 1;
        }
      }
      result.push(line.substring(start).replace(/^"|"$/g, '').trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim());

    const findIndex = (keys) => {
      return headers.findIndex(h => keys.some(k => h.includes(k)));
    };

    const idxTitle = findIndex(['title', 'name', 'product name', 'item name', 'product']);
    const idxCost = findIndex(['cost', 'wholesale', 'wholesale cost', 'wholesale price', 'base cost', 'price cost']);
    const idxPrice = findIndex(['mrp', 'price', 'suggested mrp', 'selling price', 'retail price', 'retail']);
    const idxSku = findIndex(['sku', 'item sku', 'code', 'product code', 'item code']);
    const idxImage1 = findIndex(['image 1', 'image1', 'image url', 'image src', 'image', 'photo', 'picture']);
    const idxImage2 = findIndex(['image 2', 'image2', 'photo 2']);
    const idxImage3 = findIndex(['image 3', 'image3', 'photo 3']);
    const idxBody = findIndex(['description', 'body', 'details', 'desc']);
    const idxType = findIndex(['category', 'type', 'cat', 'department', 'group']);

    const parsedProducts = [];

    const startRow = headers.some(h => ['title', 'name', 'sku', 'cost', 'mrp', 'category'].includes(h)) ? 1 : 0;

    for (let i = startRow; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (!row || row.length === 0) continue;

      let title = idxTitle !== -1 && row[idxTitle] ? row[idxTitle] : (row[0] || `Product #${i}`);
      if (!title || title.toLowerCase() === 'title' || title.toLowerCase() === 'name') continue;

      let rawCost = idxCost !== -1 && row[idxCost] ? row[idxCost] : '350';
      let costVal = parseFloat(String(rawCost).replace(/[^0-9.]/g, ''));
      if (isNaN(costVal) || costVal <= 0) costVal = 350;

      let rawPrice = idxPrice !== -1 && row[idxPrice] ? row[idxPrice] : '1299';
      let priceVal = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''));
      if (isNaN(priceVal) || priceVal <= 0) priceVal = costVal + 600;

      let skuVal = idxSku !== -1 && row[idxSku] ? row[idxSku] : `SKU-BULK-${Date.now()}-${i}`;

      const extractedImages = [];
      if (idxImage1 !== -1 && row[idxImage1]) extractedImages.push(row[idxImage1]);
      if (idxImage2 !== -1 && row[idxImage2]) extractedImages.push(row[idxImage2]);
      if (idxImage3 !== -1 && row[idxImage3]) extractedImages.push(row[idxImage3]);

      // Scan all cells for http URLs
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
        } else {
          typeVal = 'General Catalog';
        }
      }

      parsedProducts.push({
        id: `PROD-BULK-${Date.now()}-${i}`,
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

  // Download Sample CSV Template (Single Image Format)
  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Category,Wholesale Price,Suggested MRP,SKU,Image URL,Description\n" +
      "Smart Bluetooth Watch 8 Ultra,Electronics,450,1499,SKU-WT8-01,https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500,High-grade smart Bluetooth watch.\n" +
      "Brass Ganesha Puja Idol 6 Inch,Religious & Ceremonial,320,999,SKU-GNS-02,https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=500,Handcrafted pure brass idol.\n" +
      "Stainless Steel Thermo Water Bottle,Home & Kitchenware,280,899,SKU-BTL-03,https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500,Insulated 24-hour thermo bottle.";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "360_dropship_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process & Publish Products
  const processAndPublishProducts = (rawProducts) => {
    if (!rawProducts || rawProducts.length === 0) {
      throw new Error('No valid product rows could be parsed. Check your template headers and try again.');
    }

    const formatted = rawProducts.map((p, i) => ({
      id: p.id || `PROD-BULK-${Date.now()}-${i}`,
      name: p.name || p.title || `Product #${i + 1}`,
      category: p.category || p.type || 'General Catalog',
      wholesalePrice: parseFloat(p.wholesalePrice || p.cost || 350),
      shippingFee: 75,
      suggestedMrp: parseFloat(p.suggestedMrp || p.price || 1299),
      stock: 500,
      rating: 4.8,
      image: p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"),
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image].filter(Boolean),
      sku: p.sku || `SKU-BULK-${Date.now()}-${i}`,
      description: p.description || "Imported product."
    }));

    setUploadSuccess(true);
    setImportedCount(formatted.length);
    if (onBulkUploadSuccess) onBulkUploadSuccess(formatted);
  };

  // Method 1: Google Sheet URL / Apps Script WebApp Sync
  const handleUrlSync = async (e) => {
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

      if (rawInput.includes('docs.google.com/spreadsheets/d/')) {
        const match = rawInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          const sheetId = match[1];
          execUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        }
      }

      setProgress(50);

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
        } catch (err) {}
      }

      setProgress(80);

      let productsParsed = [];
      if (rawData) {
        if (Array.isArray(rawData)) {
          productsParsed = rawData;
        } else if (rawData && Array.isArray(rawData.products)) {
          productsParsed = rawData.products;
        } else if (typeof rawData === 'string') {
          productsParsed = parseRawDelimitedText(rawData);
        }
      }

      if (!fetchSuccess || productsParsed.length === 0) {
        throw new Error('Could not fetch products. If using Google Sheet, set Sharing to "Anyone with the link can view". If Apps Script, set access to "Anyone".');
      }

      setProgress(100);
      setSyncing(false);
      processAndPublishProducts(productsParsed);
    } catch (err) {
      setSyncing(false);
      setErrorMessage(err.message || 'Failed to fetch Google Sheet URL.');
    }
  };

  // Method 2: File Upload (.xlsx, .csv, .txt)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyncing(true);
    setProgress(30);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        setProgress(70);
        const parsed = parseRawDelimitedText(String(text));
        setProgress(100);
        setSyncing(false);
        processAndPublishProducts(parsed);
      } catch (err) {
        setSyncing(false);
        setErrorMessage('Failed to parse uploaded file. Please ensure it is a valid CSV or Excel file.');
      }
    };
    reader.onerror = () => {
      setSyncing(false);
      setErrorMessage('Could not read uploaded file.');
    };
    reader.readAsText(file);
  };

  // Method 3: Paste Text Parsing
  const handlePasteSync = (e) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setSyncing(true);
    setErrorMessage('');

    try {
      const parsed = parseRawDelimitedText(pastedText);
      setSyncing(false);
      processAndPublishProducts(parsed);
    } catch (err) {
      setSyncing(false);
      setErrorMessage('Failed to parse pasted text. Please verify formatting.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-cyan-400" /> MULTI-SOURCE BULK IMPORTER
            </span>
            <h3 className="text-xl font-extrabold font-heading mt-1">
              Bulk Catalog Product Upload
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download CSV Template"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Sample CSV
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Method Selector Tabs */}
        {!uploadSuccess && (
          <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-extrabold">
            <button
              onClick={() => setActiveUploadMethod('url')}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeUploadMethod === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" /> Google Sheet URL
            </button>
            <button
              onClick={() => setActiveUploadMethod('file')}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeUploadMethod === 'file' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Upload File (.xlsx/.csv)
            </button>
            <button
              onClick={() => setActiveUploadMethod('paste')}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeUploadMethod === 'paste' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Raw Text
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!uploadSuccess ? (
            <>
              {/* METHOD 1: GOOGLE SHEET / WEBAPP URL */}
              {activeUploadMethod === 'url' && (
                <form onSubmit={handleUrlSync} className="space-y-4">
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
                    <span className="font-extrabold text-blue-700 block">⚡ Direct Google Sheet & Apps Script Sync</span>
                    <p className="text-slate-600 leading-relaxed">
                      Paste your live Apps Script WebApp URL or shared Google Sheet CSV link to sync all catalog items!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Google Sheet URL or WebApp Link *
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full px-4 pl-10 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!googleSheetUrl || syncing}
                    className="w-full btn-primary py-3.5 text-xs font-extrabold justify-center shadow-md shadow-blue-600/30 disabled:opacity-50"
                  >
                    {syncing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Fetching Products...</> : '⚡ Sync Catalog Now →'}
                  </button>
                </form>
              )}

              {/* METHOD 2: FILE UPLOAD (.xlsx / .csv) */}
              {activeUploadMethod === 'file' && (
                <div className="space-y-4 text-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 p-8 rounded-3xl cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-heading">
                        Click or Drag Excel / CSV File Here
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports <code>.csv</code>, <code>.tsv</code>, <code>.xlsx</code> text formats up to 10,000 rows.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .tsv, .txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {/* METHOD 3: PASTE RAW TEXT */}
              {activeUploadMethod === 'paste' && (
                <form onSubmit={handlePasteSync} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Paste Spreadsheet Data (Tab / Comma Separated) *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`Title\tCategory\tWholesale Price\tSuggested MRP\tSKU\tImage URL\tDescription\nSmart Watch\tElectronics\t450\t1499\tSKU-01\thttps://...\tHigh quality watch`}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!pastedText.trim() || syncing}
                    className="w-full btn-primary py-3.5 text-xs font-extrabold justify-center shadow-md shadow-blue-600/30 disabled:opacity-50"
                  >
                    {syncing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Parsing Raw Text...</> : 'Import Pasted Catalog Rows →'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-xl font-heading text-slate-900 font-heading">Catalog Bulk Upload Complete!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Successfully processed and imported <strong>{importedCount} product items</strong> into your live wholesale catalog!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs font-extrabold py-3.5 px-8 rounded-xl shadow-md shadow-blue-600/30"
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
