import { NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/lib/docker';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const container = await getContainer(params.id);
    
    if (!container) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ container }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/containers/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to get container', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
