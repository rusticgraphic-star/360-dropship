/**
 * Live Supabase REST & Auth Production API Service
 * Connected to: https://keadwgyxmgjvwlzkgkis.supabase.co
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://keadwgyxmgjvwlzkgkis.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYWR3Z3l4bWdqdndsemtna2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODA2MzYsImV4cCI6MjEwMDQ1NjYzNn0.wYxtPkudru2EDuWz1pbEgz_TAc2TYHlcB3OdDidR2oU';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export const supabaseApi = {
  // 1. Google 1-Click OAuth Redirect
  signInWithGoogle() {
    const redirectUrl = encodeURIComponent(`${window.location.origin}/#/dashboard`);
    const googleOAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
    window.location.href = googleOAuthUrl;
  },

  // 2. Send 6-Digit Email Verification OTP
  async sendEmailOtp(email) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, create_user: true })
      });
      const data = await res.json();
      return { success: res.ok && !data.error, data, error: data.error };
    } catch (err) {
      console.error('Supabase Send Email OTP Error:', err);
      return { success: false, error: err };
    }
  },

  // 3. Verify Email OTP Code
  async verifyEmailOtp(email, token) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'email', email, token })
      });
      const data = await res.json();
      return { success: res.ok && !data.error, data, error: data.error };
    } catch (err) {
      console.error('Supabase Verify Email OTP Error:', err);
      return { success: false, error: err };
    }
  },

  // 4. Supabase User Signup (Email & Password)
  async signUpEmail(email, password, fullName) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          password,
          data: { full_name: fullName }
        })
      });
      const data = await res.json();
      return { success: res.ok && !data.error, data, error: data.error };
    } catch (err) {
      console.error('Supabase Auth Signup Error:', err);
      return { success: false, error: err };
    }
  },

  // 5. Supabase User Signin (Email & Password)
  async signInEmail(email, password) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return { success: res.ok && !data.error, data, error: data.error };
    } catch (err) {
      console.error('Supabase Auth Signin Error:', err);
      return { success: false, error: err };
    }
  },

  // 6. Fetch Master Products Catalog from Live Database Table
  async fetchProducts() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
        method: 'GET',
        headers
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Supabase Fetch Products Error:', err);
      return null;
    }
  },

  // 7. Save Wallet Top-Up Record in Database
  async recordWalletTopup(userId, amount, totalPaid, utrNumber) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/wallet_topups`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          amount,
          gst_amount: amount * 0.18,
          total_paid: totalPaid,
          utr_number: utrNumber,
          status: 'APPROVED'
        })
      });
      return await res.json();
    } catch (err) {
      console.error('Supabase Wallet Topup Error:', err);
      return null;
    }
  }
};
