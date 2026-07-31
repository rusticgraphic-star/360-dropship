// Vercel Serverless Function: Pull orders from connected Shopify store
import https from 'https';

function shopifyRequest(shop, token, method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: shop,
      port: 443,
      path: `/admin/api/2024-01${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { shop, token, status, limit } = req.body || {};

    if (!shop || !token) {
      return res.status(200).json({
        success: false,
        error: 'Missing required fields: shop, token. Connect your store in Shopify Store Manager first.',
      });
    }

    // Clean shop domain
    let cleanShop = String(shop).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanShop.includes('.')) {
      cleanShop = `${cleanShop}.myshopify.com`;
    }
    const cleanToken = String(token).trim();

    // Build query params
    const queryLimit = Math.min(Number(limit) || 50, 250);
    const orderStatus = status || 'any';
    const queryPath = `/orders.json?status=${orderStatus}&limit=${queryLimit}&order=created_at+desc`;

    // Fetch orders from Shopify
    const response = await shopifyRequest(cleanShop, cleanToken, 'GET', queryPath);

    if (response.status === 200) {
      const orders = response.data && response.data.orders ? response.data.orders : [];

      // Transform orders to simplified format
      const simplifiedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number || order.name,
        name: order.name,
        email: order.email || '',
        phone: order.phone || (order.shipping_address ? order.shipping_address.phone : ''),
        createdAt: order.created_at,
        totalPrice: order.total_price,
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
        customerName: order.shipping_address
          ? `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim()
          : (order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'N/A'),
        shippingAddress: order.shipping_address ? {
          address1: order.shipping_address.address1 || '',
          address2: order.shipping_address.address2 || '',
          city: order.shipping_address.city || '',
          province: order.shipping_address.province || '',
          zip: order.shipping_address.zip || '',
          country: order.shipping_address.country || 'India',
          phone: order.shipping_address.phone || '',
        } : null,
        lineItems: (order.line_items || []).map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || '',
          variantTitle: item.variant_title || '',
          productId: item.product_id,
        })),
        itemCount: (order.line_items || []).reduce((sum, item) => sum + item.quantity, 0),
        note: order.note || '',
        tags: order.tags || '',
        adminUrl: `https://${cleanShop}/admin/orders/${order.id}`,
      }));

      return res.status(200).json({
        success: true,
        orders: simplifiedOrders,
        totalOrders: simplifiedOrders.length,
        shop: cleanShop,
      });
    } else {
      let errorMsg = 'Failed to fetch orders from Shopify.';
      if (response.status === 401) {
        errorMsg = 'Invalid Access Token or Store Domain. Make sure your token starts with "shpat_" and your store domain is "yourstore.myshopify.com". Re-connect in Shopify Store Sync.';
      } else if (response.data && response.data.errors) {
        errorMsg = typeof response.data.errors === 'string'
          ? response.data.errors
          : JSON.stringify(response.data.errors);
      }
      return res.status(200).json({
        success: false,
        error: errorMsg,
        statusCode: response.status,
      });
    }
  } catch (err) {
    console.error('Pull orders error:', err);
    return res.status(200).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
}
