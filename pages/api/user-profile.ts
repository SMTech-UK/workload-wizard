import { auth0 } from '../../lib/auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth0.getSession(req);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get Management API token
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
    const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
    if (!domain || !clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing Auth0 environment variables.' });
    }

    const tokenRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error("Token fetch failed:", error);
      return res.status(tokenRes.status).json({ error });
    }

    const { access_token } = await tokenRes.json();

    // Fetch full user profile
    const userId = session.user.sub;
    const profileRes = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileRes.ok) {
      const error = await profileRes.text();
      console.error("Profile fetch failed:", error);
      return res.status(profileRes.status).json({ error });
    }

    const profile = await profileRes.json();
    return res.status(200).json(profile);
  } catch (err: any) {
    console.error("Unexpected error in /api/user-profile:", err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
} 