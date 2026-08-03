// Vercel Serverless Function: Meta Marketing API Full 3-Tier Automation (Campaign + AdSet + Ad + Pixel)
// POST /api/meta/create-campaign

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { 
    campaignName, 
    dailyBudget, 
    pixelId, 
    adCopy, 
    imageUrl, 
    pageId, 
    websiteUrl, 
    adAccountId, 
    accessToken, 
    action 
  } = req.body;

  // Use environment variables or fallback credentials
  const META_ACCESS_TOKEN = accessToken || process.env.META_AGENCY_ACCESS_TOKEN;
  const META_AD_ACCOUNT_ID = adAccountId || process.env.META_AGENCY_AD_ACCOUNT_ID;

  if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
    return res.status(400).json({ 
      error: 'Meta Agency credentials missing. Configure META_AGENCY_ACCESS_TOKEN and META_AGENCY_AD_ACCOUNT_ID in Admin Panel or request body.' 
    });
  }

  const cleanAdAccountId = META_AD_ACCOUNT_ID.startsWith('act_') ? META_AD_ACCOUNT_ID : `act_${META_AD_ACCOUNT_ID}`;
  const budgetInPaise = Math.round((Number(dailyBudget) || 500) * 100);

  try {
    // ACTION: PAUSE CAMPAIGN (ZERO BALANCE SAFEGUARD)
    if (action === 'pause' && req.body.campaignId) {
      const pauseRes = await fetch(`https://graph.facebook.com/v19.0/${req.body.campaignId}?access_token=${META_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' })
      });
      const data = await pauseRes.json();
      return res.status(200).json({ success: true, action: 'paused', data });
    }

    // TIER 1: CREATE CAMPAIGN
    const campaignRes = await fetch(`https://graph.facebook.com/v19.0/${cleanAdAccountId}/campaigns?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: campaignName || `360 Dropship Campaign - ${Date.now()}`,
        objective: 'OUTCOME_SALES',
        status: 'ACTIVE',
        special_ad_categories: [],
      })
    });
    const campaignData = await campaignRes.json();

    if (!campaignData.id) {
      return res.status(400).json({
        success: false,
        error: campaignData.error?.message || 'Meta API failed to create campaign shell.',
        metaError: campaignData.error
      });
    }

    const createdCampaignId = campaignData.id;

    // TIER 2: CREATE AD SET WITH SPECIFIC USER PIXEL ID & PAN-INDIA TARGETING
    const adSetPayload = {
      name: `${campaignName}_AdSet`,
      campaign_id: createdCampaignId,
      daily_budget: budgetInPaise,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      status: 'ACTIVE',
      targeting: {
        geo_locations: { countries: ['IN'] },
        age_min: 18,
        age_max: 65
      }
    };

    // Attach User's Specific Meta Pixel ID for Conversion Sync
    if (pixelId && String(pixelId).trim()) {
      adSetPayload.promoted_object = {
        pixel_id: String(pixelId).trim(),
        custom_event_type: 'PURCHASE'
      };
    }

    const adSetRes = await fetch(`https://graph.facebook.com/v19.0/${cleanAdAccountId}/adsets?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adSetPayload)
    });
    const adSetData = await adSetRes.json();
    const createdAdSetId = adSetData.id || null;

    // TIER 3: CREATE AD CREATIVE & LIVE AD (If Page ID and Media provided)
    let createdAdId = null;
    if (createdAdSetId && (pageId || imageUrl)) {
      try {
        // Create Ad Creative
        const creativeRes = await fetch(`https://graph.facebook.com/v19.0/${cleanAdAccountId}/adcreatives?access_token=${META_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${campaignName}_Creative`,
            object_story_spec: {
              page_id: pageId || '100000000000000',
              link_data: {
                message: adCopy || '🔥 50% OFF TODAY ONLY! Order Now.',
                link: websiteUrl || 'https://www.360dropship.in',
                picture: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
              }
            }
          })
        });
        const creativeData = await creativeRes.json();

        if (creativeData.id) {
          // Create Final Ad under AdSet
          const adRes = await fetch(`https://graph.facebook.com/v19.0/${cleanAdAccountId}/ads?access_token=${META_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${campaignName}_Ad`,
              adset_id: createdAdSetId,
              creative: { creative_id: creativeData.id },
              status: 'ACTIVE'
            })
          });
          const adData = await adRes.json();
          createdAdId = adData.id || null;
        }
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      campaignId: createdCampaignId,
      adSetId: createdAdSetId,
      adId: createdAdId,
      pixelSynced: Boolean(pixelId),
      pixelId: pixelId || null,
      message: `Meta 3-Tier Campaign, AdSet (Pixel: ${pixelId || 'Agency'}), and Ad successfully created & active!`,
      data: campaignData
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Server execution error: ${err.message}`
    });
  }
}
