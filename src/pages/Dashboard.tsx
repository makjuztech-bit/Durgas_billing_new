import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

import { DashboardHeroBanner } from '@/components/dashboard/DashboardHeroBanner';
import { DashboardMetricsCards } from '@/components/dashboard/DashboardMetricsCards';
import { RecentBillsCard } from '@/components/dashboard/RecentBillsCard';
import { DashboardSidebarPanels } from '@/components/dashboard/DashboardSidebarPanels';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bills } = useData();

  // Statistics Calculations
  const today = new Date().toISOString().split('T')[0];
  const todaysBills = bills.filter(
    (b) => b.date === today && (b.status === 'Paid' || b.status === 'Due')
  );
  const totalSalesToday = todaysBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  const totalSalesEver = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const totalDiscounts = bills.reduce((sum, b) => sum + (b.discountAmount || 0), 0);
  const totalTax = bills.reduce((sum, b) => sum + (b.taxAmount || 0), 0);
  const totalItemsBilled = bills.reduce(
    (sum, b) => sum + b.items.reduce((iSum, i) => iSum + i.qty, 0),
    0
  );
  const avgBillValue = bills.length > 0 ? Math.round(totalSalesEver / bills.length) : 0;

  const recentBills = bills.slice(0, 5);

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Welcome Banner */}
      <DashboardHeroBanner
        userName={user?.name}
        welcomeText={t('common.welcome')}
      />

      {/* Stats Cards Grid */}
      <DashboardMetricsCards
        totalSalesToday={totalSalesToday}
        todaysBillsCount={todaysBills.length}
        totalSalesEver={totalSalesEver}
        totalBillsCount={bills.length}
        totalDiscounts={totalDiscounts}
        totalTax={totalTax}
      />

      {/* Balanced 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column (2 Cols): Recent Bills Activity */}
        <RecentBillsCard recentBills={recentBills} />

        {/* Right Column (1 Col): Insights & Quick Operations */}
        <DashboardSidebarPanels
          avgBillValue={avgBillValue}
          totalItemsBilled={totalItemsBilled}
          totalBillsCount={bills.length}
        />
      </div>
    </div>
  );
};

export default Dashboard;
