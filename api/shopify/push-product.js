// Vercel Serverless Function: Push a product to connected Shopify store
import https from 'https';

function shopifyRequest(shop, token, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: shop,
      path: `/admin/api/2024-01${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
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
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { shop, token, product } = req.body;

  if (!shop || !token || !product) {
    return res.status(400).json({
      error: 'Missing required fields: shop, token, product',
      example: {
        shop: 'mystore.myshopify.com',
        token: 'shpat_xxxxx',
        product: {
          title: 'Product Name',
          body_html: 'Description',
          variants: [{ price: '999.00', sku: 'SKU-001' }],
          images: [{ src: 'https://example.com/image.jpg' }]
        }
      }
    });
  }

  try {
    // Clean shop domain
    const cleanShop = shop.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

    // Create product on Shopify
    const response = await shopifyRequest(cleanShop, token, 'POST', '/products.json', {
      product: {
        title: product.title || product.name || 'Untitled Product',
        body_html: product.body_html || product.description || '',
        vendor: product.vendor || '360 Dropship',
        product_type: product.product_type || product.category || '',
        status: 'active',
        variants: product.variants || [{
          price: String(product.price || product.suggestedMrp || '999'),
          compare_at_price: product.compare_at_price ? String(product.compare_at_price) : null,
          sku: product.sku || '',
          inventory_management: 'shopify',
          inventory_quantity: product.stock || 100,
          requires_shipping: true,
          weight: product.weight || 0.5,
          weight_unit: 'kg',
        }],
        images: product.images
          ? (Array.isArray(product.images)
            ? product.images.map(img => typeof img === 'string' ? { src: img } : img)
            : [{ src: product.images }])
          : (product.image ? [{ src: product.image }] : []),
        tags: product.tags || '360dropship, dropshipping',
      }
    });

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
          variants: createdProduct.variants?.map(v => ({
            id: v.id,
            price: v.price,
            sku: v.sku,
          })),
          images: createdProduct.images?.map(i => ({ id: i.id, src: i.src })),
        }
      });
    } else {
      console.error('Shopify API error:', response);
      return res.status(response.status || 422).json({
        success: false,
        error: 'Failed to create product on Shopify',
        details: response.data,
      });
    }
  } catch (err) {
    console.error('Push product error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
