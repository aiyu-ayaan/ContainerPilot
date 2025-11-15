'use client';

import { useApp } from '@/contexts/app-context';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ContainerTableRow } from './container-table-row';

export function ContainerList() {
  const { containers } = useApp();

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
            {containers.map((container) => (
              <ContainerTableRow key={container.id} container={container} />
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
