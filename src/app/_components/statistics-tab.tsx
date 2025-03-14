// _components/statistics-tab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import StatisticsChart from './statistics-chart';
import RunningTimeChart from './running-time-chart';
import HistoricalCharts from './historical-charts';
import AlarmTab from './alarms-tab';
import axios from 'axios';

interface BatteryDetailData {
  package_name: string;
  discharge_working_hours: number;
  charge_working_hours: number;
  idle_working_hours: number;
  cycle_charge: number;
  total_discharge_ah: number;
  batt_wh_charge: number;
  batt_wh_discharge: number;
  charging_cycle: number;
  total_charge_ah: number;
  working_hour_telemetri: number;
  charging_hour_telemetri: number;
  [key: string]: any; // Allow for any other properties
}

interface StatisticsTabProps {
  packageName: string;
}

type ChartMode = 'Charge' | 'Discharge';
type TimePeriod = 'Day' | 'Week' | 'Month';
type ChartTab = 'Running Time' | 'Capacity' | 'Historical' | 'Alarms';

const StatisticsTab: React.FC<StatisticsTabProps> = ({ packageName }) => {
  const [batteryData, setBatteryData] = useState<BatteryDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('Charge');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Day');
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('Running Time');

  // Fetch battery details
  useEffect(() => {
    const fetchBatteryDetails = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get(
          `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail?package_name=${packageName}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.data && response.data.length > 0) {
          setBatteryData(response.data[0]);
        } else {
          setError('No battery data found');
        }
      } catch (err: any) {
        console.error('Error fetching battery details:', err);
        setError(err.message || 'Failed to load battery details');
      } finally {
        setLoading(false);
      }
    };
    
    if (packageName) {
      fetchBatteryDetails();
    }
  }, [packageName]);

  // Format hours for display - Converting from minutes to hours
  const formatHours = (minutes: number | undefined) => {
    if (minutes === undefined) return '0 h';
    
    // Convert minutes to hours
    const hours = minutes / 60;
    
    // Format with 1 decimal place
    return `${hours.toFixed(1)} h`;
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading statistics...</div>;
  }
  
  if (error || !batteryData) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || 'No battery data available'}
      </div>
    );
  }

  return (
    <div>
      {/* Total times section */}
      <div className="flex border-b border-blue-300">
        <div className="flex-1 text-center py-6 text-white">
          <div className="text-4xl font-bold">{formatHours(batteryData.charge_working_hours)}</div>
          <div className="text-sm mt-1">Total Charging Time</div>
        </div>
        <div className="w-px bg-blue-300"></div>
        <div className="flex-1 text-center py-6 text-white">
          <div className="text-4xl font-bold">{formatHours(batteryData.working_hour_telemetri)}</div>
          <div className="text-sm mt-1">Total Running Time</div>
        </div>
      </div>

      {/* Chart section */}
      <div className="bg-white rounded-t-3xl mt-3 px-4 py-4">
        {/* Chart type tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {['Running Time', 'Capacity', 'Historical', 'Alarms'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-gray-700 font-medium ${
                activeChartTab === tab ? 'border-b-2 border-blue-500' : ''
              }`}
              onClick={() => setActiveChartTab(tab as ChartTab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Running Time chart */}
        {activeChartTab === 'Running Time' && (
          <RunningTimeChart packageName={packageName} />
        )}

        {/* Capacity chart (which includes charge/discharge toggle) */}
        {activeChartTab === 'Capacity' && (
          <>
            {/* Charge/Discharge toggle */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                className={`py-3 rounded-md font-medium ${
                  chartMode === 'Charge' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
                onClick={() => setChartMode('Charge')}
              >
                Charge
              </Button>
              <Button
                className={`py-3 rounded-md font-medium ${
                  chartMode === 'Discharge' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
                onClick={() => setChartMode('Discharge')}
              >
                Discharge
              </Button>
            </div>

            {/* Chart */}
            <StatisticsChart 
              packageName={packageName} 
              mode={chartMode}
              period={timePeriod}
            />

            {/* Time period tabs */}
            <div className="bg-gray-100 rounded-lg flex mt-6 p-1">
              <Button
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  timePeriod === 'Month' 
                    ? 'bg-white text-blue-500 shadow-sm' 
                    : 'bg-transparent text-gray-600'
                }`}
                onClick={() => setTimePeriod('Month')}
              >
                Month
              </Button>
              <Button
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  timePeriod === 'Week' 
                    ? 'bg-white text-blue-500 shadow-sm' 
                    : 'bg-transparent text-gray-600'
                }`}
                onClick={() => setTimePeriod('Week')}
              >
                Week
              </Button>
              <Button
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  timePeriod === 'Day' 
                    ? 'bg-white text-blue-500 shadow-sm' 
                    : 'bg-transparent text-gray-600'
                }`}
                onClick={() => setTimePeriod('Day')}
              >
                Day
              </Button>
            </div>
          </>
        )}

        {/* Enhanced Historical Charts */}
        {activeChartTab === 'Historical' && (
          <HistoricalCharts packageName={packageName} />
        )}

        {/* Alarms Tab */}
        {activeChartTab === 'Alarms' && (
          <AlarmTab packageName={packageName} />
        )}

        {/* Statistics boxes - shown on Running Time, Capacity and Historical tabs only */}
        {activeChartTab !== 'Alarms' && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-center text-gray-700">{batteryData.cycle_charge || 639}</div>
              <div className="text-sm text-center text-gray-500 mt-1">Number Of Charges</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-center text-gray-700">{(Math.abs(batteryData.batt_wh_charge) / 1000).toFixed(1)}kWh</div>
              <div className="text-sm text-center text-gray-500 mt-1">Charging Power</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-center text-gray-700">192.0A</div>
              <div className="text-sm text-center text-gray-500 mt-1">Average Current</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-center text-gray-700">198.0A</div>
              <div className="text-sm text-center text-gray-500 mt-1">Maximum Current</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsTab;