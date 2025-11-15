import { NextRequest, NextResponse } from 'next/server';
import { startContainer } from '@/lib/docker';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await startContainer(params.id);
    
    if (success) {
      return NextResponse.json(
        { success: true, message: 'Container started successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to start container' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in POST /api/containers/${params.id}/start:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start container', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
