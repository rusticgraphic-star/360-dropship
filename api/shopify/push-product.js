// Vercel Serverless Function: Push a product to connected Shopify store
import https from 'https';

function shopifyRequest(shop, token, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
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

    if (bodyStr) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

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
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function shopifyOAuthPost(shop, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: shop,
      port: 443,
      path: `/admin/oauth${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
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
    req.write(bodyStr);
    req.end();
  });
}

async function resolveAccessToken(shop, token) {
  let cleanToken = String(token).trim();
  if (cleanToken.startsWith('shpss_') || cleanToken.includes(':')) {
    let clientId = process.env.SHOPIFY_API_KEY || '6ba2828599b7ed2b6c32dcb5e187652a';
    let clientSecret = cleanToken;
    if (cleanToken.includes(':')) {
      const parts = cleanToken.split(':');
      clientId = parts[0];
      clientSecret = parts[1];
    }
    try {
      const exchangeRes = await shopifyOAuthPost(shop, '/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      });
      if (exchangeRes.data && exchangeRes.data.access_token) {
        return exchangeRes.data.access_token;
      }
    } catch (e) {
      console.error('Client credentials grant failed:', e);
    }
  }
  return cleanToken;
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
    const { shop, token, product } = req.body || {};

    if (!shop || !token || !product) {
      return res.status(200).json({
        success: false,
        error: 'Missing required fields: shop, token, or product. Connect your store in Shopify Store Manager first.',
      });
    }

    // Clean shop domain
    let cleanShop = String(shop).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!cleanShop.includes('.')) {
      cleanShop = `${cleanShop}.myshopify.com`;
    }
    const cleanToken = await resolveAccessToken(cleanShop, token);

    // Build the images array
    let shopifyImages = [];
    if (product.images && Array.isArray(product.images)) {
      shopifyImages = product.images.map(img => typeof img === 'string' ? { src: img } : img);
    } else if (product.image) {
      shopifyImages = [{ src: product.image }];
    }

    // Build variants
    const variants = product.variants || [{
      price: String(product.price || product.suggestedMrp || '999'),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : null,
      sku: product.sku || '',
      inventory_management: 'shopify',
      inventory_quantity: Number(product.stock) || 100,
      requires_shipping: true,
      weight: 0.5,
      weight_unit: 'kg',
    }];

    const shopifyProduct = {
      product: {
        title: String(product.title || product.name || 'Untitled Product'),
        body_html: String(product.description || ''),
        vendor: '360 Dropship',
        product_type: String(product.product_type || product.category || ''),
        status: 'active',
        variants: variants,
        images: shopifyImages,
        tags: '360dropship, dropshipping',
      }
    };

    // Create product on Shopify
    const response = await shopifyRequest(cleanShop, cleanToken, 'POST', '/products.json', shopifyProduct);

    if (response.status === 201 || response.status === 200) {
      const createdProduct = response.data && response.data.product ? response.data.product : {};
      return res.status(200).json({
        success: true,
        message: 'Product successfully pushed to Shopify!',
        shopifyProduct: {
          id: createdProduct.id,
          title: createdProduct.title,
          handle: createdProduct.handle,
          status: createdProduct.status,
          url: `https://${cleanShop}/products/${createdProduct.handle}`,
          adminUrl: `https://${cleanShop}/admin/products/${createdProduct.id}`,
        }
      });
    } else {
      let errorMsg = 'Failed to create product on Shopify.';
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
    console.error('Push product error:', err);
    return res.status(200).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
}
