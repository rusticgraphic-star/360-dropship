// Vercel Serverless Function: Shopify OAuth - Step 1: Redirect to Shopify Consent Screen
export default function handler(req, res) {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Missing "shop" parameter. Example: ?shop=mystore.myshopify.com' });
  }

  // Clean the shop domain
  let cleanShop = shop.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!cleanShop.includes('.myshopify.com') && !cleanShop.includes('.')) {
    cleanShop = `${cleanShop}.myshopify.com`;
  }

  const apiKey = process.env.SHOPIFY_API_KEY || '6ba2828599b7ed2b6c32dcb5e187652a';
  const scopes = 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory';
  
  const redirectUri = 'https://www.360dropship.in/api/shopify/callback';

  // Generate a random nonce for CSRF protection
  const nonce = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

  const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;

  // Redirect user to Shopify consent screen
  res.redirect(302, authUrl);
}
