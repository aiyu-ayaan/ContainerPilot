import type { Container } from '@/lib/types';

export const initialContainers: Container[] = [
  { id: 'a1b2c3d4', name: 'webapp-prod', image: 'nginx', currentVersion: '1.21.0', latestVersion: '1.25.1', status: 'running', updateState: 'idle' },
  { id: 'b2c3d4e5', name: 'api-service', image: 'node', currentVersion: '18.12.1', latestVersion: '18.17.0', status: 'running', updateState: 'idle' },
  { id: 'c3d4e5f6', name: 'postgres-db', image: 'postgres', currentVersion: '14.5', latestVersion: '14.5', status: 'running', updateState: 'idle' },
  { id: 'd4e5f6g7', name: 'redis-cache', image: 'redis', currentVersion: '7.0.4', latestVersion: '7.0.12', status: 'running', updateState: 'idle' },
  { id: 'e5f6g7h8', name: 'log-processor', image: 'fluentd', currentVersion: 'v1.14.0', latestVersion: 'v1.14.0', status: 'stopped', updateState: 'idle' },
  { id: 'f6g7h8i9', name: 'monitoring-agent', image: 'prometheus', currentVersion: 'v2.38.0', latestVersion: 'v2.45.0', status: 'running', updateState: 'idle' },
];
