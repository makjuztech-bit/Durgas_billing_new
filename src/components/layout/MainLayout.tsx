import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Sleek localized page skeleton that keeps the sidebar & header static and stable
const ContentSkeleton = () => (
  <div className="space-y-6 animate-pulse p-2">
    <div className="flex items-center justify-between pb-4 border-b border-border/40">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-md" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
    <Skeleton className="h-80 w-full rounded-xl" />
  </div>
);

export const MainLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopHeader />
          <main className="flex-1 overflow-auto bg-gradient-cream p-4 sm:p-6 lg:p-8 silk-pattern">
            <div className="mx-auto max-w-7xl w-full space-y-6">
              <Suspense fallback={<ContentSkeleton />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
