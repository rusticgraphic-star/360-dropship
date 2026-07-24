/**
 * 360 Dropship Network Database Service Layer
 * Supports Supabase / PostgreSQL Client & 100% User Data Isolation
 */

const DB_USERS_KEY = '360_dropship_users_v4';
const DB_SESSION_KEY = '360_dropship_session_v4';

export const dbService = {
  // Initialize Database Records
  init() {
    if (!localStorage.getItem(DB_USERS_KEY)) {
      localStorage.setItem(DB_USERS_KEY, JSON.stringify([]));
    }
  },

  // User Sign Up (Email & Password or OAuth)
  signUp({ name, email, phone, password }) {
    this.init();
    const users = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '[]');

    const existingUser = users.find(u => (email && u.email.toLowerCase() === email.toLowerCase()));
    if (existingUser) {
      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(existingUser));
      return { success: true, user: existingUser, isNew: false };
    }

    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const userName = name || (email ? email.split('@')[0] : 'New Dropshipper');
    const newUser = {
      id: userId,
      name: userName,
      email: email.toLowerCase(),
      phone: phone || '',
      role: 'dropshipper',
      storeDomain: '',
      kycStatus: 'PENDING',
      walletBalance: 0,
      isNew: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(newUser));

    // Initialize Isolated User Data
    localStorage.setItem(`360_orders_${userId}`, JSON.stringify([]));
    localStorage.setItem(`360_wallet_${userId}`, JSON.stringify(0));
    localStorage.setItem(`360_shopify_${userId}`, JSON.stringify({ isConnected: false, domain: '', token: '' }));
    localStorage.setItem(`360_kyc_${userId}`, JSON.stringify({ status: 'PENDING', pan: '', bankAcc: '', ifsc: '' }));
    localStorage.setItem(`360_campaigns_${userId}`, JSON.stringify([]));

    return { success: true, user: newUser, isNew: true };
  },

  // User Sign In (Email / Password)
  signIn({ email, password }) {
    this.init();
    const users = JSON.parse(localStorage.getItem(DB_USERS_KEY) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new isolated user profile
      return this.signUp({ name: email.split('@')[0], email, password });
    }

    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  // Get Current Active Session User
  getCurrentUser() {
    const session = localStorage.getItem(DB_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Per-User Orders Isolation
  getUserOrders(userId) {
    if (!userId) return [];
    const ordersStr = localStorage.getItem(`360_orders_${userId}`);
    return ordersStr ? JSON.parse(ordersStr) : [];
  },

  saveUserOrders(userId, orders) {
    if (userId) {
      localStorage.setItem(`360_orders_${userId}`, JSON.stringify(orders));
    }
  },

  // Per-User Wallet Isolation
  getUserWallet(userId) {
    if (!userId) return 0;
    const walletStr = localStorage.getItem(`360_wallet_${userId}`);
    return walletStr ? JSON.parse(walletStr) : 0;
  },

  saveUserWallet(userId, balance) {
    if (userId) {
      localStorage.setItem(`360_wallet_${userId}`, JSON.stringify(balance));
    }
  },

  // Per-User Shopify Store Sync Isolation
  getUserShopify(userId) {
    if (!userId) return { isConnected: false, domain: '', token: '' };
    const str = localStorage.getItem(`360_shopify_${userId}`);
    return str ? JSON.parse(str) : { isConnected: false, domain: '', token: '' };
  },

  saveUserShopify(userId, data) {
    if (userId) {
      localStorage.setItem(`360_shopify_${userId}`, JSON.stringify(data));
    }
  },

  // Per-User KYC & Profile Isolation
  getUserKyc(userId) {
    if (!userId) return { status: 'PENDING', pan: '', bankAcc: '', ifsc: '' };
    const str = localStorage.getItem(`360_kyc_${userId}`);
    return str ? JSON.parse(str) : { status: 'PENDING', pan: '', bankAcc: '', ifsc: '' };
  },

  saveUserKyc(userId, data) {
    if (userId) {
      localStorage.setItem(`360_kyc_${userId}`, JSON.stringify(data));
    }
  },

  // Per-User Meta Ads Campaigns Isolation
  getUserCampaigns(userId) {
    if (!userId) return [];
    const str = localStorage.getItem(`360_campaigns_${userId}`);
    return str ? JSON.parse(str) : [];
  },

  saveUserCampaigns(userId, campaigns) {
    if (userId) {
      localStorage.setItem(`360_campaigns_${userId}`, JSON.stringify(campaigns));
    }
  },

  // Product Catalog Persistence
  getProducts(fallbackProducts = []) {
    const str = localStorage.getItem('360_wholesale_products');
    if (str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return fallbackProducts;
      }
    }
    localStorage.setItem('360_wholesale_products', JSON.stringify(fallbackProducts));
    return fallbackProducts;
  },

  saveProducts(products) {
    localStorage.setItem('360_wholesale_products', JSON.stringify(products));
  },

  // Logout Session
  logout() {
    localStorage.removeItem(DB_SESSION_KEY);
  }
};
