import { NextRequest, NextResponse } from 'next/server';
import { listContainers } from '@/lib/docker';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all') !== 'false'; // default to true
    
    const containers = await listContainers(all);
    
    return NextResponse.json({ containers }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/containers:', error);
    return NextResponse.json(
      { error: 'Failed to list containers', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
