import { auth0 } from '../../lib/auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await auth0.getSession(req);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
    const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
    if (!domain || !clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing Auth0 environment variables.' });
    }

    // Get Management API token
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
      console.error('Token fetch failed:', error);
      return res.status(tokenRes.status).json({ error });
    }

    const { access_token } = await tokenRes.json();

    // Parse update fields from request body
    const {
      userId,
      name,
      email,
      picture,
      job_title,
      team,
      specialism,
      office_location,
      notifications,
      privacy,
      preferences,
      user_metadata, // fallback for popover
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Compose user_metadata
    const metadata = user_metadata || {
      job_title,
      team,
      specialism,
      office_location,
      notifications,
      privacy,
      preferences,
    };

    // Remove undefined fields
    Object.keys(metadata).forEach(
      (key) => metadata[key] === undefined && delete metadata[key]
    );

    // Prepare update payload
    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (picture !== undefined) updatePayload.picture = picture;
    if (Object.keys(metadata).length > 0) updatePayload.user_metadata = metadata;

    // Update user in Auth0
    const updateRes = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateRes.ok) {
      const error = await updateRes.text();
      console.error('Profile update failed:', error);
      return res.status(updateRes.status).json({ error });
    }

    const updatedUser = await updateRes.json();
    return res.status(200).json({ user: updatedUser });
  } catch (err: any) {
    console.error('Unexpected error in /api/auth0-update-profile:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
} 