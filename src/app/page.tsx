import { Ship, Settings, Container as ContainerIcon } from 'lucide-react';
import { AppProvider } from '@/contexts/app-context';
import { Configuration } from '@/components/configuration';
import { ContainerList } from '@/components/container-list';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <Ship className="h-8 w-8" />
            <h1 className="text-3xl font-bold font-headline">ContainerPilot</h1>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Settings className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>
                    Manage application settings and preferences.
                  </CardDescription>
                </div>
              </CardHeader>
              <Configuration />
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <ContainerIcon className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle>Containers</CardTitle>
                  <CardDescription>
                    Monitor and manage your running Docker containers.
                  </CardDescription>
                </div>
              </CardHeader>
              <ContainerList />
            </Card>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
