// Vercel Serverless Function: Meta Marketing API (Graph API) Campaign Creation & Safeguard
// POST /api/meta/create-campaign

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { campaignName, dailyBudget, adAccountId, accessToken, action } = req.body;

  // Use environment variables or fallback credentials
  const META_ACCESS_TOKEN = accessToken || process.env.META_AGENCY_ACCESS_TOKEN;
  const META_AD_ACCOUNT_ID = adAccountId || process.env.META_AGENCY_AD_ACCOUNT_ID;

  if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
    return res.status(400).json({ 
      error: 'Meta Agency credentials missing. Configure META_AGENCY_ACCESS_TOKEN and META_AGENCY_AD_ACCOUNT_ID in environment or request body.' 
    });
  }

  const cleanAdAccountId = META_AD_ACCOUNT_ID.startsWith('act_') ? META_AD_ACCOUNT_ID : `act_${META_AD_ACCOUNT_ID}`;

  try {
    if (action === 'pause' && req.body.campaignId) {
      // Pause Campaign via Meta Graph API
      const pauseRes = await fetch(`https://graph.facebook.com/v19.0/${req.body.campaignId}?access_token=${META_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' })
      });
      const data = await pauseRes.json();
      return res.status(200).json({ success: true, action: 'paused', data });
    }

    // Create New Sales Campaign via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v19.0/${cleanAdAccountId}/campaigns?access_token=${META_ACCESS_TOKEN}`;
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: campaignName || `360 Dropship Campaign - ${Date.now()}`,
        objective: 'OUTCOME_SALES',
        status: 'ACTIVE',
        daily_budget: Math.round((Number(dailyBudget) || 500) * 100), // In Paise/Cents
        special_ad_categories: [],
      })
    });

    const data = await response.json();

    if (data.id) {
      return res.status(200).json({
        success: true,
        campaignId: data.id,
        message: 'Meta Ad Campaign successfully created via Meta Agency Marketing API!',
        data
      });
    } else {
      return res.status(400).json({
        success: false,
        error: data.error?.message || 'Meta Marketing API returned an error.',
        metaError: data.error
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server execution error: ${err.message}`
    });
  }
}
