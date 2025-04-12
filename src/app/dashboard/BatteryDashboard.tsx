// components/BatteryDashboard.tsx
"use client";

import { useBatterySummary } from "@/hooks/useBatterySummary";
import { BatteryData } from "@/lib/types";

// Import all dashboard components
import { DashboardHeader } from "./_components/DashboardHeader";
import { BatteryStatusCard } from "./_components/BatteryStatusCard";
import { SOCCategoryCard } from "./_components/SOCCategoryCard";
import { SOHCategoryCard } from "./_components/SOHCategoryCard";
import { UtilizationCard } from "./_components/UtilizationCard";
import { OperationalStats } from "./_components/OperationalStats";
import { BatteryDistribution } from "./_components/BatteryDistribution";
import { BatteryList } from "./_components/BatteryList";
import { BatteryLocationMap } from "./_components/BatteryLocationMap";
import { SignalQualityCard } from "./_components/SignalQualityCard";

interface BatteryDashboardProps {
    data: BatteryData[] | undefined;
    isLoading: boolean;
    error: any;
  }
  
  export default function BatteryDashboard({
    data,
    isLoading,
    error,
  }: BatteryDashboardProps) {
    // Use the summary hook to calculate all metrics
    const summaryData = useBatterySummary(data);
  
    if (isLoading) {
      return (
        <div className="grid place-items-center h-60">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Error loading dashboard data</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      );
    }
  
    if (!data || data.length === 0) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-600">No battery data available for dashboard</p>
        </div>
      );
    }
  
    if (!summaryData) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-600">Unable to generate summary data</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        {/* Dashboard Header with Raw Data Button */}
        <DashboardHeader data={data} />
  
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BatteryStatusCard 
            totalBatteries={summaryData.totalBatteries} 
            activeBatteries={summaryData.activeBatteries} 
          />
          <SOCCategoryCard 
            socCategories={summaryData.socCategories} 
            validSocCount={summaryData.validSocCount} 
          />
          <SOHCategoryCard 
            sohCategories={summaryData.sohCategories} 
            validSohCount={summaryData.validSohCount} 
          />
          <SignalQualityCard
            signalCategories={summaryData.signalCategories}
            totalBatteries={summaryData.totalBatteries}
          />
          <UtilizationCard 
            activeTimePercentage={summaryData.activeTimePercentage} 
          />
        </div>
  
        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OperationalStats 
            totalWorkingHours={summaryData.totalWorkingHours}
            avgChargingCycle={summaryData.avgChargingCycle}
            avgCapacity={summaryData.avgCapacity}
            energyEfficiency={summaryData.energyEfficiency}
            avgEstimatedCycles={summaryData.avgEstimatedCycles}
            maxTemp={summaryData.maxTemp}
          />
          <BatteryDistribution 
            brandDistribution={summaryData.brandDistribution}
            softwareVersions={summaryData.softwareVersions}
            totalBatteries={summaryData.totalBatteries}
          />
        </div>
  
        {/* Location Map Section */}
        <div className="mt-6">
          <BatteryLocationMap data={data} />
        </div>
  
        {/* Detailed Battery List */}
        <div className="mt-6">
          <BatteryList data={data} />
        </div>
      </div>
    );
  }