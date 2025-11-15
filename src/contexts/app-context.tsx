'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Container } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";


interface AppContextType {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  autoUpdate: boolean;
  setAutoUpdate: (enabled: boolean) => void;
  pollingTime: number;
  setPollingTime: (time: number) => void;
  updateContainer: (containerId: string) => Promise<void>;
  startContainer: (containerId: string) => Promise<void>;
  refreshContainers: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [pollingTime, setPollingTime] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch containers from the API
  const refreshContainers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/containers?all=true');
      if (!response.ok) {
        throw new Error('Failed to fetch containers');
      }
      const data = await response.json();
      setContainers(data.containers || []);
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Failed to fetch containers from Docker',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    try {
      const response = await fetch('/api/containers/check-all-updates');
      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }
      const data = await response.json();
      const updates = data.updates || {};
      
      // Update containers with latest version info
      setContainers(prev => prev.map(c => {
        if (updates[c.id]) {
          return {
            ...c,
            latestVersion: updates[c.id].latestVersion,
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      await refreshContainers();
      // Check for updates immediately after loading containers
      await checkForUpdates();
    };
    initialize();
  }, [refreshContainers, checkForUpdates]);
  
  // Check for updates periodically
  useEffect(() => {
    // Set up interval to check for updates periodically
    const intervalId = setInterval(() => {
      checkForUpdates();
    }, pollingTime * 1000);
    
    return () => clearInterval(intervalId);
  }, [pollingTime, checkForUpdates]);

  const updateContainer = useCallback(async (containerId: string) => {
    const containerToUpdate = containers.find(c => c.id === containerId);
    if (!containerToUpdate) return;
    
    setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'updating' as const } : c));
    toast({ title: 'Starting Update...', description: `Updating container ${containerToUpdate.name}.` });

    try {
      // Call the API to update the container
      const response = await fetch(`/api/containers/${containerId}/update`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        const logs = result.logs || 'Container updated successfully.';
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'success' as const, logs } : c));
        toast({ title: 'Update Successful', description: `Container ${containerToUpdate.name} updated successfully.` });
        // Refresh container list after update
        await refreshContainers();
      } else {
        const errorLogs = result.logs || result.error || 'Unknown error occurred';
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'error' as const, logs: errorLogs } : c));
        toast({
          variant: "destructive",
          title: 'Update Failed',
          description: `Failed to update ${containerToUpdate.name}.`,
        });
      }
    } catch (error) {
      console.error("Error during update process:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'error' as const, logs: `Failed to communicate with the update service: ${errorMessage}` } : c));
      toast({
          variant: "destructive",
          title: 'Update Error',
          description: 'An unexpected error occurred.',
      });
    }
  }, [containers, toast, refreshContainers]);

  const startContainer = useCallback(async (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    try {
      const response = await fetch(`/api/containers/${containerId}/start`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({ title: 'Container Started', description: `Container ${container.name} has been started.` });
        // Refresh container list after starting
        await refreshContainers();
      } else {
        toast({
          variant: "destructive",
          title: 'Error',
          description: `Failed to start ${container.name}.`,
        });
      }
    } catch (error) {
      console.error("Error starting container:", error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Failed to start container.',
      });
    }
  }, [containers, toast, refreshContainers]);
  
  // Auto-update polling
  useEffect(() => {
    if (!autoUpdate) return;

    const intervalId = setInterval(async () => {
      // Refresh container list to check for updates
      await refreshContainers();
      
      const containersToUpdate = containers.filter(c => 
        c.status === 'running' && 
        c.currentVersion !== c.latestVersion && 
        c.updateState === 'idle'
      );
      if (containersToUpdate.length > 0) {
        toast({
          title: "Auto-Update Triggered",
          description: `Found ${containersToUpdate.length} container(s) to update.`
        })
        for (const container of containersToUpdate) {
          await updateContainer(container.id);
        }
      }
    }, pollingTime * 1000);

    return () => clearInterval(intervalId);
  }, [autoUpdate, pollingTime, containers, updateContainer, toast, refreshContainers]);


  const value = {
    containers,
    setContainers,
    autoUpdate,
    setAutoUpdate,
    pollingTime,
    setPollingTime,
    updateContainer,
    startContainer,
    refreshContainers,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
