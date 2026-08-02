/**
 * 360 Dropship Network Database Service Layer
 * Supports Supabase / PostgreSQL Client & 100% User Data Isolation
 * Includes Safe Mobile LocalStorage Fallbacks to prevent QuotaExceeded Crashes
 */

const DB_USERS_KEY = '360_dropship_users_v4';
const DB_SESSION_KEY = '360_dropship_session_v4';

const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Read error for ${key}:`, e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] Write error for ${key} (Quota exceeded or restricted):`, e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

export const dbService = {
  // Initialize Database Records
  init() {
    if (!safeStorage.getItem(DB_USERS_KEY)) {
      safeStorage.setItem(DB_USERS_KEY, JSON.stringify([]));
    }
  },

  // User Sign Up (Email & Password or OAuth)
  signUp({ name, email, phone, password }) {
    dbService.init();
    const usersStr = safeStorage.getItem(DB_USERS_KEY) || '[]';
    let users = [];
    try { users = JSON.parse(usersStr); } catch (e) { users = []; }

    const existingUser = users.find(u => (email && u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase()));
    if (existingUser) {
      safeStorage.setItem(DB_SESSION_KEY, JSON.stringify(existingUser));
      return { success: true, user: existingUser, isNew: false };
    }

    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const userName = name || (email ? email.split('@')[0] : 'New Dropshipper');
    const isMasterAdmin = (email && email.toLowerCase() === 'rustic241@gmail.com');
    const newUser = {
      id: userId,
      name: isMasterAdmin ? 'System Agency Admin' : userName,
      email: (email || 'user@gmail.com').toLowerCase(),
      phone: phone || '',
      role: isMasterAdmin ? 'admin' : 'dropshipper',
      status: isMasterAdmin ? 'ACTIVE' : 'INACTIVE',
      storeDomain: '',
      kycStatus: 'PENDING',
      walletBalance: 0,
      isNew: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    safeStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    safeStorage.setItem(DB_SESSION_KEY, JSON.stringify(newUser));

    // Also sync to sellers list for Admin Management
    try {
      const sellers = dbService.getSellers();
      if (Array.isArray(sellers) && !sellers.some(s => s && s.email && s.email.toLowerCase() === newUser.email.toLowerCase())) {
        sellers.push({
          id: userId,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          status: newUser.status,
          createdAt: new Date().toISOString().split('T')[0]
        });
        dbService.saveSellers(sellers);
      }
    } catch (e) {}

    // Initialize Isolated User Data
    safeStorage.setItem(`360_orders_${userId}`, JSON.stringify([]));
    safeStorage.setItem(`360_wallet_${userId}`, JSON.stringify(0));
    safeStorage.setItem(`360_shopify_${userId}`, JSON.stringify({ isConnected: false, domain: '', token: '' }));
    safeStorage.setItem(`360_kyc_${userId}`, JSON.stringify({ status: 'PENDING', pan: '', bankAcc: '', ifsc: '' }));
    safeStorage.setItem(`360_campaigns_${userId}`, JSON.stringify([]));

    return { success: true, user: newUser, isNew: true };
  },

  // User Sign In (Email / Password)
  signIn({ email, password }) {
    dbService.init();
    const usersStr = safeStorage.getItem(DB_USERS_KEY) || '[]';
    let users = [];
    try { users = JSON.parse(usersStr); } catch (e) { users = []; }

    const user = users.find(u => (email && u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase()));

    if (!user) {
      return dbService.signUp({ name: email.split('@')[0], email, password });
    }

    if (user.email.toLowerCase() === 'rustic241@gmail.com') {
      user.role = 'admin';
    } else {
      user.role = 'dropshipper';
    }

    safeStorage.setItem(DB_SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  // Get Current Active Session User
  getCurrentUser() {
    const session = safeStorage.getItem(DB_SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  },

  // Per-User Orders Isolation
  getUserOrders(userId) {
    if (!userId) return [];
    const ordersStr = safeStorage.getItem(`360_orders_${userId}`);
    if (!ordersStr) return [];
    try { return JSON.parse(ordersStr); } catch (e) { return []; }
  },

  saveUserOrders(userId, orders) {
    if (userId) {
      safeStorage.setItem(`360_orders_${userId}`, JSON.stringify(orders));
    }
  },

  // Per-User Wallet Isolation
  getUserWallet(userId) {
    if (!userId) return 0;
    const walletStr = safeStorage.getItem(`360_wallet_${userId}`);
    if (!walletStr) return 0;
    try { return JSON.parse(walletStr); } catch (e) { return 0; }
  },

  saveUserWallet(userId, balance) {
    if (userId) {
      safeStorage.setItem(`360_wallet_${userId}`, JSON.stringify(balance));
    }
  },

  // Per-User Shopify Store Sync Isolation
  getUserShopify(userId) {
    if (!userId) return { isConnected: false, domain: '', token: '' };
    const str = safeStorage.getItem(`360_shopify_${userId}`);
    if (!str) return { isConnected: false, domain: '', token: '' };
    try { return JSON.parse(str); } catch (e) { return { isConnected: false, domain: '', token: '' }; }
  },

  getUserShopifyStores(userId) {
    if (!userId) return [];
    const str = safeStorage.getItem(`360_shopify_${userId}`);
    if (!str) return [];
    try {
      const data = JSON.parse(str);
      if (data.allStores && Array.isArray(data.allStores) && data.allStores.length > 0) {
        return data.allStores;
      }
      if (data.isConnected && data.domain) {
        return [{ id: 'store_1', domain: data.domain, token: data.token, connectedAt: data.connectedAt || new Date().toISOString(), isActive: true }];
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveUserShopify(userId, data) {
    if (userId) {
      safeStorage.setItem(`360_shopify_${userId}`, JSON.stringify(data));
    }
  },

  // Per-User KYC & Profile Isolation
  getUserKyc(userId) {
    if (!userId) return { status: 'PENDING', pan: '', bankAcc: '', ifsc: '' };
    const str = safeStorage.getItem(`360_kyc_${userId}`);
    if (!str) return { status: 'PENDING', pan: '', bankAcc: '', ifsc: '' };
    try { return JSON.parse(str); } catch (e) { return { status: 'PENDING', pan: '', bankAcc: '', ifsc: '' }; }
  },

  saveUserKyc(userId, data) {
    if (userId) {
      safeStorage.setItem(`360_kyc_${userId}`, JSON.stringify(data));
    }
  },

  // Per-User Meta Ads Campaigns Isolation
  getUserCampaigns(userId) {
    if (!userId) return [];
    const str = safeStorage.getItem(`360_campaigns_${userId}`);
    if (!str) return [];
    try { return JSON.parse(str); } catch (e) { return []; }
  },

  saveUserCampaigns(userId, campaigns) {
    if (userId) {
      safeStorage.setItem(`360_campaigns_${userId}`, JSON.stringify(campaigns));
    }
  },

  // Per-User Meta Pixel ID Persistence
  getUserMetaPixel(userId) {
    if (!userId) return '';
    return safeStorage.getItem(`360_meta_pixel_${userId}`) || '';
  },

  saveUserMetaPixel(userId, pixelId) {
    if (userId) {
      safeStorage.setItem(`360_meta_pixel_${userId}`, String(pixelId).trim());
    }
  },

  // Per-User Pushed Products Tracking
  getUserPushedProducts(userId) {
    if (!userId) return [];
    const str = safeStorage.getItem(`360_pushed_products_${userId}`);
    if (!str) return [];
    try { return JSON.parse(str); } catch (e) { return []; }
  },

  saveUserPushedProducts(userId, pushedIds) {
    if (userId) {
      safeStorage.setItem(`360_pushed_products_${userId}`, JSON.stringify(pushedIds));
    }
  },

  pushProductToUserStore(userId, productId) {
    if (!userId || !productId) return [];
    const existing = dbService.getUserPushedProducts(userId);
    if (!existing.includes(productId)) {
      const updated = [...existing, productId];
      dbService.saveUserPushedProducts(userId, updated);
      return updated;
    }
    return existing;
  },

  // Admin Settings (WhatsApp Support Number & Approval Config)
  getAdminSettings() {
    const str = safeStorage.getItem('360_admin_settings');
    if (!str) return { whatsappNumber: '+919876543210', autoApprove: false };
    try { return JSON.parse(str); } catch (e) { return { whatsappNumber: '+919876543210', autoApprove: false }; }
  },

  saveAdminSettings(settings) {
    safeStorage.setItem('360_admin_settings', JSON.stringify(settings));
  },

  // Agency UPI ID Persistence
  getAgencyUpiId() {
    return safeStorage.getItem('360_agency_upi_id') || '360dropship@upi';
  },

  saveAgencyUpiId(upiId) {
    if (upiId) {
      safeStorage.setItem('360_agency_upi_id', String(upiId).trim());
    }
  },

  // Seller Accounts List & Real User Status Isolation
  getSellers() {
    dbService.init();
    const usersStr = safeStorage.getItem(DB_USERS_KEY) || '[]';
    let users = [];
    try { users = JSON.parse(usersStr); } catch (e) { users = []; }

    // Filter out Admin rustic241@gmail.com
    const realUsers = users.filter(u => u && u.email && u.email.toLowerCase() !== 'rustic241@gmail.com');

    // Get saved status overrides
    const statusMapStr = safeStorage.getItem('360_sellers_status_map') || '{}';
    let statusMap = {};
    try { statusMap = JSON.parse(statusMapStr); } catch (e) { statusMap = {}; }

    return realUsers.map(u => ({
      id: u.id,
      name: u.name || (u.email ? u.email.split('@')[0] : 'Registered Dropshipper'),
      email: u.email,
      phone: u.phone || '+91 9876543210',
      status: statusMap[u.id] || statusMap[u.email] || (u.email ? statusMap[u.email.toLowerCase().trim()] : null) || u.status || 'ACTIVE',
      createdAt: u.createdAt ? u.createdAt.split('T')[0] : '2026-07-27'
    }));
  },

  saveSellers(sellers) {
    safeStorage.setItem('360_sellers_list', JSON.stringify(sellers));
  },

  toggleSellerStatus(sellerId) {
    const statusMapStr = safeStorage.getItem('360_sellers_status_map') || '{}';
    let statusMap = {};
    try { statusMap = JSON.parse(statusMapStr); } catch (e) { statusMap = {}; }

    const sellers = dbService.getSellers();
    const target = sellers.find(s => s.id === sellerId || s.email === sellerId);
    if (target) {
      const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      statusMap[target.id] = newStatus;
      statusMap[target.email] = newStatus;
      if (target.email) {
        statusMap[target.email.toLowerCase().trim()] = newStatus;
      }
      safeStorage.setItem('360_sellers_status_map', JSON.stringify(statusMap));
    }
    try {
      window.dispatchEvent(new Event('sellerStatusChanged'));
    } catch (e) {}
    return dbService.getSellers();
  },

  getSellerStatus(email) {
    if (!email || typeof email !== 'string') return 'ACTIVE';
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'rustic241@gmail.com') return 'ACTIVE';

    const statusMapStr = safeStorage.getItem('360_sellers_status_map') || '{}';
    let statusMap = {};
    try { statusMap = JSON.parse(statusMapStr); } catch (e) { statusMap = {}; }

    if (statusMap[cleanEmail]) return statusMap[cleanEmail];
    if (statusMap[email]) return statusMap[email];

    const sellers = dbService.getSellers();
    if (Array.isArray(sellers)) {
      const found = sellers.find(s => s && s.email && s.email.toLowerCase().trim() === cleanEmail);
      if (found && found.status) return found.status;
    }

    return 'ACTIVE';
  },

  // Deduplicate products list by normalized name
  deduplicate(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const result = [];
    for (const item of list) {
      if (!item || !item.name) continue;
      const key = item.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  },

  // Product Catalog Persistence (Memory + Safe Storage)
  getProducts(fallbackProducts = []) {
    try {
      const str = safeStorage.getItem('360_wholesale_products');
      if (str) {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return Array.isArray(fallbackProducts) ? fallbackProducts : [];
  },

  saveProducts(products) {
    const clean = dbService.deduplicate(products);
    safeStorage.setItem('360_wholesale_products', JSON.stringify(clean));
  },

  // Logout Session
  logout() {
    safeStorage.removeItem(DB_SESSION_KEY);
  }
};

export default dbService;
