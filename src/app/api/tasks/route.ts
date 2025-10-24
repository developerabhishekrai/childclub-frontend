import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch tasks from backend
    const response = await fetch('http://localhost:3003/tasks');
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        title: 'Mathematics Assignment - Chapter 5',
        type: 'assignment',
        dueDate: '2024-12-25T23:59:59',
        status: 'pending',
        assignedTo: 'Class 10A',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Science Project - Ecosystem',
        type: 'project',
        dueDate: '2024-12-30T23:59:59',
        status: 'in_progress',
        assignedTo: 'Class 9B',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'English Essay - My Dream',
        type: 'homework',
        dueDate: '2024-12-22T23:59:59',
        status: 'completed',
        assignedTo: 'Class 8C',
        priority: 'low'
      }
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create task in backend
    const response = await fetch('http://localhost:3003/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    const task = await response.json();
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

