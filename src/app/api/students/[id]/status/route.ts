import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Update student status in backend
    const response = await fetch(`http://localhost:3003/students/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update student status');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating student status:', error);
    return NextResponse.json({ error: 'Failed to update student status' }, { status: 500 });
  }
}

