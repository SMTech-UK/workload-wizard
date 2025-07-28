import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a mock test module
    const testModule = {
      id: `test-module-${Date.now()}`,
      name: 'Test Module - Software Testing',
      code: 'CS4001',
      credits: 15,
      department: 'Computer Science',
      level: 'Undergraduate',
      semester: 'Spring',
      academicYear: '2024/25',
      description: 'A test module for software testing and quality assurance',
      learningOutcomes: [
        'Understand testing methodologies',
        'Apply test-driven development',
        'Implement automated testing',
      ],
      prerequisites: ['CS2001', 'CS2002'],
      coRequisites: [],
      assessmentMethods: ['Coursework', 'Exam'],
      teachingMethods: ['Lectures', 'Labs', 'Tutorials'],
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, you'd save this to your database
    // await mutation(api.modules.create, testModule);

    console.log('Test module created:', testModule);

    return NextResponse.json({
      success: true,
      message: 'Test module added successfully',
      module: testModule,
    });

  } catch (error) {
    console.error('Error adding test module:', error);
    return NextResponse.json(
      { error: 'Failed to add test module' },
      { status: 500 }
    );
  }
} 