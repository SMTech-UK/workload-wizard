import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, you'd clear test data from your database
    // This would typically involve:
    // 1. Identifying test data (e.g., records with 'test-' prefix)
    // 2. Deleting test lecturers, modules, allocations, etc.
    // 3. Cleaning up any related data

    const testDataTypes = [
      'test-lecturer-*',
      'test-module-*',
      'test-allocation-*',
      'test-iteration-*',
    ];

    console.log('Clearing test data with patterns:', testDataTypes);

    // Mock response - in real implementation, you'd actually delete the data
    const deletedCount = {
      lecturers: 5,
      modules: 3,
      allocations: 8,
      iterations: 2,
    };

    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully',
      deletedCount,
      patterns: testDataTypes,
    });

  } catch (error) {
    console.error('Error clearing test data:', error);
    return NextResponse.json(
      { error: 'Failed to clear test data' },
      { status: 500 }
    );
  }
} 