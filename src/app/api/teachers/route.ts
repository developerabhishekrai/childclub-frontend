import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch teachers from backend
    const response = await fetch('http://localhost:3003/teachers');
    
    if (!response.ok) {
      throw new Error('Failed to fetch teachers');
    }

    const teachers = await response.json();
    
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@school.com',
        department: 'Mathematics',
        status: 'active',
        subjects: ['Mathematics', 'Physics']
      },
      {
        id: '2',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@school.com',
        department: 'Science',
        status: 'active',
        subjects: ['Chemistry', 'Biology']
      },
      {
        id: '3',
        firstName: 'Meera',
        lastName: 'Patel',
        email: 'meera.patel@school.com',
        department: 'English',
        status: 'active',
        subjects: ['English', 'Literature']
      }
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create teacher in backend
    const response = await fetch('http://localhost:3003/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create teacher');
    }

    const teacher = await response.json();
    
    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}

