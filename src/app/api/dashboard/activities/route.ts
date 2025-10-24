import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch activities from backend
    const response = await fetch('http://localhost:3003/dashboard/activities');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard activities');
    }

    const activities = await response.json();
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching dashboard activities:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        description: 'New student Abhishek Rai registered',
        icon: 'user-plus',
        time: '2 minutes ago'
      },
      {
        id: '2',
        description: 'Teacher Priya Sharma created new assignment',
        icon: 'book',
        time: '15 minutes ago'
      },
      {
        id: '3',
        description: 'Class 10A attendance marked',
        icon: 'check-circle',
        time: '1 hour ago'
      },
      {
        id: '4',
        description: 'New event "Annual Sports Day" added',
        icon: 'calendar',
        time: '2 hours ago'
      },
      {
        id: '5',
        description: 'Task "Mathematics Quiz" completed by 25 students',
        icon: 'tasks',
        time: '3 hours ago'
      }
    ]);
  }
}

