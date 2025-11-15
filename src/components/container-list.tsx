'use client';

import { useApp } from '@/contexts/app-context';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ContainerTableRow } from './container-table-row';
import { Loader2 } from 'lucide-react';

export function ContainerList() {
  const { containers, isLoading } = useApp();

  return (
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Container Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Current Version</TableHead>
              <TableHead>Latest Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading containers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No containers found. Make sure Docker is running and you have containers.
                </TableCell>
              </TableRow>
            ) : (
              containers.map((container) => (
                <ContainerTableRow key={container.id} container={container} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
