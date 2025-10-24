import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch students from backend
    const response = await fetch('http://localhost:3000/students');
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    const students = await response.json();
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        firstName: 'Abhishek',
        lastName: 'Rai',
        email: 'abhishekrai123@yopmail.com',
        status: 'active',
        currentClass: 'Class 10A',
        enrollmentDate: '2024-01-15T00:00:00'
      },
      {
        id: '2',
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'priya.singh@yopmail.com',
        status: 'active',
        currentClass: 'Class 9B',
        enrollmentDate: '2024-01-10T00:00:00'
      }
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received student data:', body);

    // For now, just return success - in production this would save to database
    // TODO: Implement actual database save logic
    
    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      data: {
        id: Date.now(), // Generate a temporary ID
        ...body,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error registering student:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to register student',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
