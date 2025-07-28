import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Note: This requires Vercel API token and proper setup
    // You'll need to add VERCEL_API_TOKEN to your environment variables
    const token = process.env.VERCEL_API_TOKEN;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Vercel API token not configured',
        message: 'Add VERCEL_API_TOKEN to your environment variables'
      }, { status: 500 });
    }

    // Fetch analytics data from Vercel API
    const analyticsResponse = await fetch(
      `https://vercel.com/api/v1/web/insights/stats?projectId=${projectId}&since=24h`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!analyticsResponse.ok) {
      throw new Error(`Vercel API error: ${analyticsResponse.status}`);
    }

    const analyticsData = await analyticsResponse.json();

    // Fetch performance data
    const performanceResponse = await fetch(
      `https://vercel.com/api/v1/web/insights/performance?projectId=${projectId}&since=24h`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!performanceResponse.ok) {
      throw new Error(`Vercel Performance API error: ${performanceResponse.status}`);
    }

    const performanceData = await performanceResponse.json();

    return NextResponse.json({
      analytics: analyticsData,
      performance: performanceData,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Error fetching Vercel data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Vercel data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 