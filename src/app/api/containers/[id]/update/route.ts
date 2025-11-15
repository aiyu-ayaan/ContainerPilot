import { NextRequest, NextResponse } from 'next/server';
import { updateContainer } from '@/lib/docker';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await updateContainer(params.id);
    
    if (result.success) {
      return NextResponse.json(
        { success: true, logs: result.logs },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, logs: result.logs, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in POST /api/containers/${params.id}/update:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update container', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
