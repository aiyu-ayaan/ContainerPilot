# ContainerPilot

A modern web application for managing Docker containers with real-time updates, monitoring, and automated container management.

## Features

- 📦 List and monitor all Docker containers
- 🚀 Start/stop containers through the UI
- 🔄 Automatic container updates with configurable polling
- 📊 Real-time container status monitoring
- 🔔 Toast notifications for user actions
- 🎨 Clean, modern UI with responsive design

## Prerequisites

- Docker must be running on your system
- Node.js 18+ required
- Access to Docker socket (typically `/var/run/docker.sock`)

## Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```bash
# Docker Configuration
# Path to Docker socket
DOCKER_SOCKET_PATH=/var/run/docker.sock

# For WSL2 users, you may need to use one of these paths:
# DOCKER_SOCKET_PATH=/mnt/wsl/shared-docker/docker.sock
# DOCKER_SOCKET_PATH=//./pipe/docker_engine

# Server Configuration
PORT=9002
```

### WSL2 Docker Configuration

If you're using WSL2, Docker Desktop typically exposes the socket at a different path. You have a few options:

1. **Using Docker Desktop's WSL integration** (recommended):
   ```bash
   DOCKER_SOCKET_PATH=/var/run/docker.sock
   ```

2. **Using shared socket path**:
   ```bash
   DOCKER_SOCKET_PATH=/mnt/wsl/shared-docker/docker.sock
   ```

3. **Using Windows named pipe** (requires additional configuration):
   ```bash
   DOCKER_SOCKET_PATH=//./pipe/docker_engine
   ```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration (see above)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:9002](http://localhost:9002) in your browser

## Usage

### Container Management

- **View Containers**: All containers are listed with their current status
- **Start Container**: Click the "Start" button for stopped containers
- **Update Container**: Click "Update Now" for containers with available updates
- **Auto-Update**: Enable auto-updates in the Configuration section to automatically update containers when new versions are available

### Configuration

- **Auto Updates**: Toggle automatic container updates
- **Polling Time**: Set how often (in seconds) to check for container updates (default: 60 seconds)

## API Endpoints

- `GET /api/containers` - List all Docker containers
- `GET /api/containers/[id]` - Get specific container details
- `POST /api/containers/[id]/start` - Start a stopped container
- `POST /api/containers/[id]/update` - Update a container to the latest image
- `GET /api/containers/[id]/check-updates` - Check if updates are available

## How It Works

The application uses the following approach to detect container updates:

1. For each container, it gets the running container's image ID
2. It pulls the latest image manifest (without downloading layers)
3. It compares the running image ID with the latest image ID
4. If they differ, an update is available

This method is efficient and accurate, ensuring you're always aware of available updates.

## Build

To create a production build:

```bash
npm run build
npm start
```

## Technologies

- **Next.js 15.3** - React framework
- **TypeScript** - Type safety
- **Dockerode** - Docker API client
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons
