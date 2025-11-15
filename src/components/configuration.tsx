'use client';

import { useApp } from '@/contexts/app-context';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export function Configuration() {
  const { autoUpdate, setAutoUpdate, pollingTime, setPollingTime } = useApp();

  return (
    <CardContent className="grid gap-6 sm:grid-cols-2 p-6">
      <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border bg-card-foreground/5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auto-update" className="font-semibold">
            Enable Auto Updates
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically update containers when a new version is available.
          </p>
        </div>
        <Switch
          id="auto-update"
          checked={autoUpdate}
          onCheckedChange={setAutoUpdate}
          aria-label="Enable auto updates"
        />
      </div>
      <div className="space-y-2 p-4 rounded-lg border bg-card-foreground/5">
        <Label htmlFor="polling-time" className="font-semibold">
          Polling Time (seconds)
        </Label>
        <p className="text-sm text-muted-foreground">
          How often to check for new container image versions.
        </p>
        <Input
          id="polling-time"
          type="number"
          value={pollingTime}
          onChange={(e) => setPollingTime(Math.max(10, Number(e.target.value)))}
          placeholder="e.g., 60"
          min="10"
        />
      </div>
    </CardContent>
  );
}
