// Vercel Serverless Function: Push a product to connected Shopify store
const https = require('https');

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

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { shop, token, product } = req.body || {};

  if (!shop || !token || !product) {
    return res.status(400).json({
      error: 'Missing required fields: shop, token, product',
    });
  }

  try {
    // Clean shop domain - remove protocol and trailing slashes
    const cleanShop = shop.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

    console.log(`Pushing product to ${cleanShop}...`);
    console.log(`Token starts with: ${token.substring(0, 8)}...`);

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
      inventory_quantity: product.stock || 100,
      requires_shipping: true,
      weight: product.weight || 0.5,
      weight_unit: 'kg',
    }];

    const shopifyProduct = {
      product: {
        title: product.title || product.name || 'Untitled Product',
        body_html: product.description || '',
        vendor: product.vendor || '360 Dropship',
        product_type: product.product_type || product.category || '',
        status: 'active',
        variants: variants,
        images: shopifyImages,
        tags: product.tags || '360dropship, dropshipping',
      }
    };

    console.log('Shopify payload:', JSON.stringify(shopifyProduct).substring(0, 500));

    // Create product on Shopify
    const response = await shopifyRequest(cleanShop, token, 'POST', '/products.json', shopifyProduct);

    console.log('Shopify response status:', response.status);
    console.log('Shopify response:', JSON.stringify(response.data).substring(0, 500));

    if (response.status === 201 || response.status === 200) {
      const createdProduct = response.data.product;
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
      return res.status(422).json({
        success: false,
        error: 'Failed to create product on Shopify',
        details: response.data,
        statusCode: response.status,
      });
    }
  } catch (err) {
    console.error('Push product error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
