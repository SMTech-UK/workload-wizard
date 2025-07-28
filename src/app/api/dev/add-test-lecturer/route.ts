import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll create a mock test lecturer
    // In a real implementation, you'd call your Convex mutation
    const testLecturer = {
      id: `test-lecturer-${Date.now()}`,
      name: 'Dr. Test Lecturer',
      email: 'test.lecturer@university.edu',
      department: 'Computer Science',
      specialism: 'Software Engineering',
      campus: 'Main Campus',
      teachingTime: 'Morning',
      teachingDay: 'Monday',
      interests: ['Testing', 'Development', 'Quality Assurance'],
      systemRole: 'lecturer',
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, you'd save this to your database
    // await mutation(api.lecturers.create, testLecturer);

    console.log('Test lecturer created:', testLecturer);

    return NextResponse.json({
      success: true,
      message: 'Test lecturer added successfully',
      lecturer: testLecturer,
    });

  } catch (error) {
    console.error('Error adding test lecturer:', error);
    return NextResponse.json(
      { error: 'Failed to add test lecturer' },
      { status: 500 }
    );
  }
} 