import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, you'd query your database
    // For now, we'll return a simulated count
    const totalUsers = Math.floor(Math.random() * 200) + 100; // 100-300 users
    
    return NextResponse.json({
      count: totalUsers,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 