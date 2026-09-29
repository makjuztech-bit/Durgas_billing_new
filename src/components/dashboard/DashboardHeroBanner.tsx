import React from 'react';
import { Plus, History, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface DashboardHeroBannerProps {
  userName?: string;
  welcomeText: string;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  userName,
  welcomeText,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-accent p-6 sm:p-8 text-primary-foreground shadow-lg shadow-maroon">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0 font-normal">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-amber-300" />
              System Ready & Synchronized
            </Badge>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {welcomeText}, {userName || 'Store Manager'}!
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Welcome to Durgas. Issue bills, print instant receipts, and track your persistent sales ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md font-semibold gap-2 border-0"
            onClick={() => navigate('/billing')}
          >
            <Plus className="h-5 w-5" />
            Create New Bill
          </Button>
          <Button
            size="lg"
            className="bg-white/15 hover:bg-white/25 text-white border border-white/40 shadow-sm font-semibold gap-2 backdrop-blur-sm"
            onClick={() => navigate('/bill-history')}
          >
            <History className="h-5 w-5" />
            Sales Ledger
          </Button>
        </div>
      </div>

      {/* Decorative ambient glows */}
      <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
    </div>
  );
};
