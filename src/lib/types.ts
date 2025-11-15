export type Container = {
  id: string;
  name: string;
  image: string;
  currentVersion: string;
  latestVersion: string;
  status: 'running' | 'stopped';
  updateState: 'idle' | 'checking' | 'updating' | 'success' | 'error';
  logs?: string;
  updateCommand?: string;
};
