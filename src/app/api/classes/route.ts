import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch classes from backend
    const response = await fetch('http://localhost:3003/classes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }

    const classes = await response.json();
    
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        name: 'Class 10A',
        grade: '10',
        section: 'A',
        studentCount: 35,
        teacherName: 'Priya Sharma',
        status: 'active'
      },
      {
        id: '2',
        name: 'Class 9B',
        grade: '9',
        section: 'B',
        studentCount: 32,
        teacherName: 'Rajesh Kumar',
        status: 'active'
      },
      {
        id: '3',
        name: 'Class 8C',
        grade: '8',
        section: 'C',
        studentCount: 30,
        teacherName: 'Meera Patel',
        status: 'active'
      }
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create class in backend
    const response = await fetch('http://localhost:3003/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create class');
    }

    const classData = await response.json();
    
    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

