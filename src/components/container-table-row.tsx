'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import type { Container } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ArrowUpToLine, CheckCircle2, CircleDashed, Loader2, Play, AlertTriangle, Terminal, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ContainerTableRow({ container }: { container: Container }) {
  const { updateContainer, startContainer } = useApp();
  const [logsOpen, setLogsOpen] = useState(false);
  const needsUpdate = container.currentVersion !== container.latestVersion;
  const isRunning = container.status === 'running';

  const renderStatusBadge = () => {
    if (!isRunning) {
      return <Badge variant="secondary"><CircleDashed className="mr-2 h-3 w-3" />Stopped</Badge>;
    }
    if (needsUpdate) {
      return <Badge variant="outline" className="text-accent-foreground bg-accent/20 border-accent"><ArrowUpToLine className="mr-2 h-3 w-3" />Update Available</Badge>;
    }
    return <Badge className="bg-green-600/20 text-green-700 hover:bg-green-600/30 border border-green-600/30"><CheckCircle2 className="mr-2 h-3 w-3" />Up to date</Badge>;
  };

  const renderActions = () => {
    switch (container.updateState) {
      case 'updating':
        return <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</Button>;
      case 'success':
        return <Button variant="ghost" size="sm" className="text-green-600" disabled><CheckCircle2 className="mr-2 h-4 w-4" />Updated</Button>;
      case 'error':
        return <Button variant="destructive" size="sm" disabled><XCircle className="mr-2 h-4 w-4" />Failed</Button>;
      default:
        if (!isRunning) {
          return <Button variant="outline" size="sm" onClick={() => startContainer(container.id)}><Play className="mr-2 h-4 w-4" />Start</Button>;
        }
        if (needsUpdate) {
          return <Button size="sm" onClick={() => updateContainer(container.id)} className="bg-accent hover:bg-accent/90"><ArrowUpToLine className="mr-2 h-4 w-4" />Update Now</Button>;
        }
        return <span className="text-sm text-muted-foreground">No actions</span>;
    }
  };

  return (
    <Collapsible asChild>
      <>
        <TableRow className="align-middle" data-state={logsOpen ? 'open' : 'closed'}>
          <TableCell className="font-medium max-w-[200px] truncate" title={container.name}>{container.name}</TableCell>
          <TableCell className="max-w-[150px] truncate" title={container.image}>{container.image}</TableCell>
          <TableCell className="max-w-[120px] truncate" title={container.currentVersion}>{container.currentVersion}</TableCell>
          <TableCell className="font-semibold text-primary max-w-[120px] truncate" title={container.latestVersion}>{container.latestVersion}</TableCell>
          <TableCell>{renderStatusBadge()}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              { (container.updateState === 'success' || container.updateState === 'error') && (
                <CollapsibleTrigger asChild>
                   <Button variant="ghost" size="icon" onClick={() => setLogsOpen(prev => !prev)}>
                    <Terminal className="h-4 w-4"/>
                    <span className="sr-only">Toggle Logs</span>
                  </Button>
                </CollapsibleTrigger>
              )}
              {renderActions()}
            </div>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={6}>
              <div className="p-4 bg-muted/50">
                <Alert variant={container.updateState === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    Update Logs
                    { container.updateState === 'error' && <span className="text-sm font-normal">AI Summary available</span>}
                  </AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-48 mt-2">
                      <pre className="text-xs whitespace-pre-wrap font-mono p-4 bg-background rounded-md border">{container.logs || 'No logs available.'}</pre>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
