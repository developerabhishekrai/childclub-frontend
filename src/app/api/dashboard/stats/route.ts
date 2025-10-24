import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch stats from backend
    const response = await fetch('http://localhost:3003/dashboard/stats');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const stats = await response.json();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json({
      totalStudents: 1250,
      totalTeachers: 48,
      totalClasses: 32,
      activeClasses: 28,
      pendingTasks: 15,
      upcomingEvents: 8,
      attendanceRate: 94.5,
      averageScore: 87.2
    });
  }
}

