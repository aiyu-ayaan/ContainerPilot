import Docker from 'dockerode';
import type { Container } from './types';

// Initialize Docker client
export const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'
});

/**
 * Convert Docker container info to our Container type
 */
export async function dockerContainerToContainer(
  dockerContainer: Docker.ContainerInfo
): Promise<Container> {
  const container = docker.getContainer(dockerContainer.Id);
  const inspectData = await container.inspect();
  
  // Extract image name and tag
  const imageParts = dockerContainer.Image.split(':');
  const image = imageParts[0];
  const currentVersion = imageParts[1] || 'latest';
  
  // Initially set latestVersion to currentVersion
  // Will be updated by periodic checks if needed
  const latestVersion = currentVersion;
  
  return {
    id: dockerContainer.Id.substring(0, 12),
    name: dockerContainer.Names[0].replace(/^\//, ''),
    image,
    currentVersion,
    latestVersion,
    status: dockerContainer.State === 'running' ? 'running' : 'stopped',
    updateState: 'idle',
  };
}

/**
 * List all Docker containers
 */
export async function listContainers(all = true): Promise<Container[]> {
  try {
    const containers = await docker.listContainers({ all });
    return await Promise.all(
      containers.map((c) => dockerContainerToContainer(c))
    );
  } catch (error) {
    console.error('Error listing containers:', error);
    throw error;
  }
}

/**
 * Get a specific container by ID
 */
export async function getContainer(id: string): Promise<Container | null> {
  try {
    const container = docker.getContainer(id);
    const data = await container.inspect();
    
    const imageParts = data.Config.Image.split(':');
    const image = imageParts[0];
    const currentVersion = imageParts[1] || 'latest';
    const latestVersion = currentVersion;
    
    return {
      id: data.Id.substring(0, 12),
      name: data.Name.replace(/^\//, ''),
      image,
      currentVersion,
      latestVersion,
      status: data.State.Running ? 'running' : 'stopped',
      updateState: 'idle',
    };
  } catch (error) {
    console.error(`Error getting container ${id}:`, error);
    return null;
  }
}

/**
 * Start a container
 */
export async function startContainer(id: string): Promise<boolean> {
  try {
    const container = docker.getContainer(id);
    await container.start();
    return true;
  } catch (error) {
    console.error(`Error starting container ${id}:`, error);
    return false;
  }
}

/**
 * Stop a container
 */
export async function stopContainer(id: string): Promise<boolean> {
  try {
    const container = docker.getContainer(id);
    await container.stop();
    return true;
  } catch (error) {
    console.error(`Error stopping container ${id}:`, error);
    return false;
  }
}

/**
 * Update a container (pull new image, stop old container, create and start new one)
 */
export async function updateContainer(
  id: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; logs: string; error?: string }> {
  let logs = '';
  
  try {
    const container = docker.getContainer(id);
    const data = await container.inspect();
    const imageName = data.Config.Image;
    const containerName = data.Name.replace(/^\//, '');
    const config = data.Config;
    const hostConfig = data.HostConfig;
    
    // Log the start
    logs += `Starting update for container: ${containerName}\n`;
    logs += `Current image: ${imageName}\n\n`;
    onProgress?.(`Starting update for ${containerName}...`);
    
    // Pull the latest image
    logs += `Pulling latest image: ${imageName}\n`;
    onProgress?.(`Pulling image ${imageName}...`);
    
    try {
      const stream = await docker.pull(imageName);
      
      await new Promise<void>((resolve, reject) => {
        docker.modem.followProgress(
          stream,
          (err: Error | null) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
          (event: { status?: string; progress?: string }) => {
            if (event.status) {
              logs += `${event.status}${event.progress ? ': ' + event.progress : ''}\n`;
            }
          }
        );
      });
      
      logs += `Image pulled successfully.\n\n`;
      onProgress?.(`Image pulled, stopping old container...`);
    } catch (pullError) {
      logs += `Failed to pull image: ${pullError}\n`;
      return { success: false, logs, error: `Failed to pull image: ${pullError}` };
    }
    
    // Stop the old container
    logs += `Stopping container: ${containerName}\n`;
    try {
      await container.stop();
      logs += `Container stopped.\n`;
    } catch (stopError: any) {
      if (stopError?.statusCode !== 304) { // 304 means already stopped
        logs += `Warning: Could not stop container: ${stopError}\n`;
      }
    }
    
    // Remove the old container
    logs += `Removing old container: ${containerName}\n`;
    onProgress?.(`Removing old container...`);
    try {
      await container.remove();
      logs += `Old container removed.\n\n`;
    } catch (removeError) {
      logs += `Warning: Could not remove container: ${removeError}\n\n`;
    }
    
    // Create a new container with the same configuration
    logs += `Creating new container with updated image...\n`;
    onProgress?.(`Creating new container...`);
    
    const newContainer = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Env: config.Env,
      Cmd: config.Cmd,
      ExposedPorts: config.ExposedPorts,
      HostConfig: {
        Binds: hostConfig.Binds,
        PortBindings: hostConfig.PortBindings,
        RestartPolicy: hostConfig.RestartPolicy,
        NetworkMode: hostConfig.NetworkMode,
      },
      Labels: config.Labels,
      WorkingDir: config.WorkingDir,
    });
    
    logs += `New container created with ID: ${newContainer.id.substring(0, 12)}\n`;
    
    // Start the new container
    logs += `Starting new container...\n`;
    onProgress?.(`Starting new container...`);
    await newContainer.start();
    logs += `Container ${containerName} started successfully.\n`;
    logs += `\nUpdate completed successfully!\n`;
    
    return { success: true, logs };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logs += `\nError during update: ${errorMsg}\n`;
    return { success: false, logs, error: errorMsg };
  }
}

/**
 * Check for updates by comparing local and remote image IDs
 */
export async function checkForUpdates(id: string): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
}> {
  try {
    const container = docker.getContainer(id);
    const data = await container.inspect();
    const imageName = data.Config.Image;
    const currentVersion = imageName.split(':')[1] || 'latest';
    
    // Get the running container's image ID
    const runningImageId = data.Image;
    
    // Pull the latest image manifest (doesn't download layers)
    await docker.pull(imageName, {});
    
    // Get the latest image ID
    const latestImage = docker.getImage(imageName);
    const latestImageData = await latestImage.inspect();
    const latestImageId = latestImageData.Id;
    
    // Compare image IDs
    const hasUpdate = runningImageId !== latestImageId;
    
    return {
      hasUpdate,
      currentVersion,
      latestVersion: hasUpdate ? `${currentVersion} (update available)` : currentVersion,
    };
  } catch (error) {
    console.error(`Error checking for updates for container ${id}:`, error);
    // If we can't check for updates, assume no update
    const data = await docker.getContainer(id).inspect();
    const currentVersion = data.Config.Image.split(':')[1] || 'latest';
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
    };
  }
}
