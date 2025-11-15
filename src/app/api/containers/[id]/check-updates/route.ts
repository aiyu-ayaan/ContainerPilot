import { NextRequest, NextResponse } from 'next/server';
import { checkForUpdates } from '@/lib/docker';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateInfo = await checkForUpdates(params.id);
    
    return NextResponse.json(updateInfo, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/containers/${params.id}/check-updates:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to check for updates', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
