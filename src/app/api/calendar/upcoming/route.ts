import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch upcoming events from backend
    const response = await fetch('http://localhost:3003/calendar/upcoming');
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming events');
    }

    const events = await response.json();
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        title: 'Parent-Teacher Meeting',
        description: 'Annual parent-teacher meeting for all classes',
        eventType: 'meeting',
        startDate: '2024-12-20T09:00:00',
        endDate: '2024-12-20T12:00:00',
        location: 'School Auditorium',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Annual Sports Day',
        description: 'Annual sports competition and cultural activities',
        eventType: 'event',
        startDate: '2024-12-25T00:00:00',
        endDate: '2024-12-25T23:59:59',
        location: 'School Ground',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Mid-term Examinations',
        description: 'Mid-term examinations for all classes',
        eventType: 'exam',
        startDate: '2024-12-30T00:00:00',
        endDate: '2025-01-05T23:59:59',
        location: 'All Classrooms',
        priority: 'high'
      },
      {
        id: '4',
        title: 'Mathematics Workshop',
        description: 'Advanced mathematics workshop for Class 10 students',
        eventType: 'curriculum',
        startDate: '2024-12-22T14:00:00',
        endDate: '2024-12-22T16:00:00',
        location: 'Room 101',
        priority: 'medium'
      },
      {
        id: '5',
        title: 'Art & Music Festival',
        description: 'Annual art and music festival showcasing student talents',
        eventType: 'activity',
        startDate: '2024-12-28T10:00:00',
        endDate: '2024-12-28T18:00:00',
        location: 'School Auditorium & Art Room',
        priority: 'medium'
      }
    ]);
  }
}

