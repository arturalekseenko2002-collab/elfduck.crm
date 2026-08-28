import React from 'react';
import RevenuePanel from '@/components/dashboard/RevenuePanel';
import KpiGrid from '@/components/dashboard/KpiGrid';
import InsightsRow from '@/components/dashboard/InsightsRow';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RetentionPanel from '@/components/dashboard/RetentionPanel';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import LocationPerformance from '@/components/dashboard/LocationPerformance';
import * as TopPartnersModule from '@/components/dashboard/TopPartners';

const TopPartners =
  TopPartnersModule.default ||
  TopPartnersModule.TopPartners ||
  Object.values(TopPartnersModule).find((value) => typeof value === 'function') ||
  (() => null);

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Row 1 — Revenue anchor + supporting KPIs */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5">
          <RevenuePanel />
        </div>
        <div className="col-span-7">
          <KpiGrid />
        </div>
      </div>

      {/* Row 2 — Insights */}
      <InsightsRow />

      {/* Row 3 — Dynamics + Retention */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <RevenueChart />
        </div>
        <div className="col-span-4">
          <RetentionPanel />
        </div>
      </div>

      {/* Row 4 — Products (full width) */}
      <ProductPerformance />

      {/* Row 5 — Sales locations (full width) */}
      <LocationPerformance />

      {/* Row 6 — Top partners */}
      <TopPartners />
    </div>
  );
}