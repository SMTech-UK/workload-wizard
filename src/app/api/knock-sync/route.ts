import { NextRequest, NextResponse } from 'next/server';
import { identifyKnockUser } from '@/lib/knock-server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, email, name, avatar, locale, timezone, systemRole } = data;
    if (!id || !email) {
      return NextResponse.json({ error: 'Missing user id or email' }, { status: 400 });
    }
    // Fetch user role, settings, specialism, jobTitle, and team from Convex
    let custom_properties: Record<string, any> = {};
    try {
      const userData = await convex.query('users:getUserBySubject' as any, { subject: id });
      if (userData) {
        if (userData.settings) custom_properties.settings = userData.settings;
        if (userData.specialism) custom_properties.specialism = userData.specialism;
        if (userData.jobTitle) custom_properties.jobTitle = userData.jobTitle;
        if (userData.team) custom_properties.team = userData.team;
      }
    } catch (err) {
      // If Convex fails, just skip custom_properties
    }
    await identifyKnockUser(id, {
      email,
      name: name,
      avatar, // use avatar field
      locale: locale || 'en-GB',
      timezone: timezone || 'Europe/London',
      systemRole: systemRole,
      custom_properties,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to sync user to Knock' }, { status: 500 });
  }
} 