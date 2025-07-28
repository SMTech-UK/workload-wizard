import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: startTime,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 10));

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ...health,
      responseTime,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 