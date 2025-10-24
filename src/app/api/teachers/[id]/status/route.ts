import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Update teacher status in backend
    const response = await fetch(`http://localhost:3003/teachers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update teacher status');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating teacher status:', error);
    return NextResponse.json({ error: 'Failed to update teacher status' }, { status: 500 });
  }
}

