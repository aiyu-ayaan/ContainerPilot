'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Container } from '@/lib/types';
import { initialContainers } from '@/data/containers';
import { useToast } from "@/hooks/use-toast";
import { suggestUpdateCommand } from '@/ai/flows/suggest-update-command';
import { summarizeUpdateLogs } from '@/ai/flows/summarize-update-logs';


interface AppContextType {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  autoUpdate: boolean;
  setAutoUpdate: (enabled: boolean) => void;
  pollingTime: number;
  setPollingTime: (time: number) => void;
  updateContainer: (containerId: string) => Promise<void>;
  startContainer: (containerId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<Container[]>(initialContainers);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [pollingTime, setPollingTime] = useState(60);
  const { toast } = useToast();

  const updateContainer = useCallback(async (containerId: string) => {
    const containerToUpdate = containers.find(c => c.id === containerId);
    if (!containerToUpdate) return;
    
    setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'updating' as const } : c));
    toast({ title: 'Starting Update...', description: `Updating container ${containerToUpdate.name}.` });

    try {
      const { updateCommand } = await suggestUpdateCommand({
        containerName: containerToUpdate.name,
        currentImage: `${containerToUpdate.image}:${containerToUpdate.currentVersion}`,
        latestImage: `${containerToUpdate.image}:${containerToUpdate.latestVersion}`,
      });
      
      setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateCommand } : c));

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        const logs = `Pulling from ${containerToUpdate.image}...\nDigest: sha256:abcde...\nStatus: Downloaded newer image for ${containerToUpdate.image}:${containerToUpdate.latestVersion}\nStopping container ${containerToUpdate.name}...\nRemoving container ${containerToUpdate.name}...\nCreating new container with image ${containerToUpdate.image}:${containerToUpdate.latestVersion}\nContainer ${containerToUpdate.name} started successfully.`;
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'success' as const, currentVersion: c.latestVersion, logs } : c));
        toast({ title: 'Update Successful', description: `Container ${containerToUpdate.name} updated to ${containerToUpdate.latestVersion}.` });
      } else {
        const errorLogs = `Error response from daemon: pull access denied for ${containerToUpdate.image}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied`;
        const { summary } = await summarizeUpdateLogs({ logs: errorLogs });
        const fullLogs = `${updateCommand}\n\n${errorLogs}\n\n--- AI Summary ---\n${summary}`;
        setContainers(prev => prev.map(c => c.id === containerId ? { ...c, updateState: 'error' as const, logs: fullLogs } : c));
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
  }, [containers, toast]);

  const startContainer = useCallback((containerId: string) => {
    setContainers(prev => prev.map(c => {
      if (c.id === containerId) {
        toast({ title: 'Container Started', description: `Container ${c.name} has been started.` });
        return { ...c, status: 'running' as const };
      }
      return c;
    }));
  }, [toast]);
  
  useEffect(() => {
    if (!autoUpdate) return;

    const intervalId = setInterval(() => {
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
        containersToUpdate.forEach(c => updateContainer(c.id));
      }
    }, pollingTime * 1000);

    return () => clearInterval(intervalId);
  }, [autoUpdate, pollingTime, containers, updateContainer, toast]);


  const value = {
    containers,
    setContainers,
    autoUpdate,
    setAutoUpdate,
    pollingTime,
    setPollingTime,
    updateContainer,
    startContainer,
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
