// Vercel Serverless Function: Push/Create Order in Admin's Shopify Store
// POST /api/shopify/push-order

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { shop, token, order } = req.body;

  if (!shop || !token || !order) {
    return res.status(400).json({ error: 'Shop domain, token, and order data are required.' });
  }

  const cleanShop = String(shop).trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const cleanToken = String(token).trim();

  // Construct Shopify Order Payload according to Shopify Admin REST API
  const customerName = order.customer_name || order.customer?.first_name || 'Dropship Customer';
  const nameParts = customerName.split(' ');
  const firstName = nameParts[0] || 'Dropship';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  const lineItems = (order.line_items && order.line_items.length > 0)
    ? order.line_items.map(item => ({
        title: item.title || item.name || 'Dropship Product',
        price: String(item.price || '999'),
        quantity: Number(item.quantity) || 1,
        sku: item.sku || ''
      }))
    : [{
        title: order.product_name || '360 Dropship Item',
        price: String(order.total_price || '999'),
        quantity: Number(order.quantity) || 1,
        sku: order.sku || ''
      }];

  const shopifyOrderPayload = {
    order: {
      line_items: lineItems,
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: order.email || order.customer?.email || 'customer@360dropship.in',
        phone: order.phone || order.shipping_address?.phone || ''
      },
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address1: order.shipping_address?.address1 || order.address || 'Street Address',
        address2: order.shipping_address?.address2 || '',
        city: order.shipping_address?.city || order.city || 'City',
        province: order.shipping_address?.province || order.state || 'State',
        zip: order.shipping_address?.zip || order.pincode || '110001',
        country: order.shipping_address?.country || 'India',
        phone: order.phone || order.shipping_address?.phone || ''
      },
      financial_status: 'paid',
      tags: `360Dropship, Seller:${order.sellerName || 'Dropshipper'}`
    }
  };

  try {
    const response = await fetch(`https://${cleanShop}/admin/api/2026-01/orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': cleanToken
      },
      body: JSON.stringify(shopifyOrderPayload)
    });

    const data = await response.json();

    if (response.ok && data.order) {
      return res.status(200).json({
        success: true,
        orderId: data.order.id,
        orderNumber: data.order.name,
        message: `Order #${data.order.name} created successfully in Admin Shopify Store ${cleanShop}!`,
        order: data.order
      });
    } else {
      return res.status(response.status || 400).json({
        success: false,
        error: data.errors ? JSON.stringify(data.errors) : 'Shopify rejected order creation request.',
        details: data
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server execution error: ${err.message}`
    });
  }
}
