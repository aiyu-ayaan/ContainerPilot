import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET(request: NextRequest) {
  try {
    const containers = await docker.listContainers({ all: false }); // Only running containers
    const updates: Record<string, { hasUpdate: boolean; latestVersion: string }> = {};
    
    // Check each container for updates
    for (const containerInfo of containers) {
      try {
        const container = docker.getContainer(containerInfo.Id);
        const data = await container.inspect();
        const imageName = data.Config.Image;
        const runningImageId = data.Image;
        
        // Pull the latest image manifest (doesn't download layers)
        await docker.pull(imageName, {});
        
        // Get the latest image ID
        const latestImage = docker.getImage(imageName);
        const latestImageData = await latestImage.inspect();
        const latestImageId = latestImageData.Id;
        
        // Compare image IDs
        const hasUpdate = runningImageId !== latestImageId;
        const currentVersion = imageName.split(':')[1] || 'latest';
        
        updates[containerInfo.Id.substring(0, 12)] = {
          hasUpdate,
          latestVersion: hasUpdate ? `${currentVersion} (update available)` : currentVersion,
        };
      } catch (error) {
        console.error(`Error checking updates for container ${containerInfo.Id}:`, error);
        // If check fails, assume no update
        updates[containerInfo.Id.substring(0, 12)] = {
          hasUpdate: false,
          latestVersion: containerInfo.Image.split(':')[1] || 'latest',
        };
      }
    }
    
    return NextResponse.json({ updates }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/containers/check-all-updates:', error);
    return NextResponse.json(
      { error: 'Failed to check for updates', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
