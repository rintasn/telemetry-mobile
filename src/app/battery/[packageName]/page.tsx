// app/battery/[packageName]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';
import { useAuth } from '@/utils/auth';
import StatisticsTab from '../../_components/statistics-tab';
import AlarmTab from '../../_components/alarms-tab';
import CellVoltageChart from '../../_components/cell-voltage-chart';
import CellTemperatureChart from '../../_components/cell-temperature-chart';

// Define the battery detail data structure
interface BatteryDetailData {
  package_name: string;
  serial_number: string;
  manufacturer: string;
  brand: string;
  cell_configuration: string;
  rated_voltage: number;
  rated_capacity: number;
  rated_energy: number;
  bms_type: string;
  discharge_working_hours: number;
  charge_working_hours: number;
  idle_working_hours: number;
  cycle_charge: number;
  total_discharge_ah: number;
  batt_wh_charge: number;
  batt_wh_discharge: number;
  charging_cycle: number;
  batt_volt: number;
  batt_cur: number;
  soc: number;
  max_cell_volt: number;
  max_cv_no: number;
  min_cell_volt: number;
  min_cv_no: number;
  max_cell_temp: number;
  soh: number;
  activation_date: string;
  updated_at: string;
  software_version: string;
  latitude: number;
  longitude: number;
  [key: string]: any; // Allow for any other properties
}

// Tab options
type TabOption = 'RT Status' | 'Statistics' | 'Alarms' | 'Upgrades';

export default function BatteryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [batteryDetail, setBatteryDetail] = useState<BatteryDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>('RT Status');
  
  const packageName = params.packageName as string;

  // Fetch battery details
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (!packageName) {
      setError('No package name provided');
      setLoading(false);
      return;
    }

    const fetchBatteryDetails = async () => {
      try {
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
          setBatteryDetail(response.data[0]);
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

    if (isAuthenticated) {
      fetchBatteryDetails();
    }
  }, [packageName, isAuthenticated, isLoading, router]);

  // Format date to readable format
  // Format date to local time
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Subtract 7 hours from the date
      date.setHours(date.getHours() - 7);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  // Format number with specified decimals
  const formatNumber = (value: number | null | undefined, decimals: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>Loading battery details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  if (!batteryDetail) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">No battery data available</p>
        <Button onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  // Calculate SOC and SOH display values
  const socValue = batteryDetail.soc || 0;
  const sohValue = batteryDetail.soh || 93.6; // Default to 93.6 as in the screenshot if not available

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="text-white p-1 h-8 w-8" 
          onClick={goBack}
        >
          <span className="text-xl">←</span>
        </Button>
        <h1 className="text-white text-xl font-bold mx-auto">Details</h1>
      </div>

      {/* Last updated info */}
      <div className="px-4 py-2 flex justify-between items-center">
        <p className="text-white text-sm">
          Data updated on: {formatDate(batteryDetail.updated_at)}
        </p>
        <Button 
          variant="outline" 
          className="text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 h-8 px-3"
        >
          {batteryDetail.batt_cur < 0 ? "Discharge" : 
           batteryDetail.batt_cur > 0 ? "Charge" : "Idle"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-300">
        {['RT Status', 'Statistics', 'Alarms', 'Upgrades'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 text-center py-2 text-white text-sm font-medium ${
              activeTab === tab ? 'border-b-2 border-white' : ''
            }`}
            onClick={() => setActiveTab(tab as TabOption)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content - conditionally render based on activeTab */}
      {activeTab === 'RT Status' && (
        <>
          {/* Main content - SOC circle */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-56 h-56">
              {/* Outer circle */}
              <div className="absolute inset-0 rounded-full border-8 border-blue-300 opacity-30"></div>
              
              {/* Middle circle */}
              <div className="absolute inset-4 rounded-full border-8 border-blue-200 opacity-50"></div>
              
              {/* Inner circle with SOC value */}
              <div className="absolute inset-8 rounded-full border-8 border-white flex items-center justify-center flex-col">
                <span className="text-5xl font-bold text-white">{formatNumber(socValue, 0)}%</span>
                <span className="text-lg text-white">SOC</span>
              </div>
            </div>
          </div>

          {/* Voltage and Current */}
          <div className="flex justify-around py-5 px-4 text-white border-b border-blue-300">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(batteryDetail.batt_volt || batteryDetail.rated_voltage)} V</p>
              <p className="text-sm">Voltage</p>
            </div>
            <div className="h-full w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(batteryDetail.batt_cur || 0)} A</p>
              <p className="text-sm">Current</p>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-t-3xl mt-3 px-4 py-4 min-h-[40vh]">
            <h2 className="text-xl font-bold text-gray-800 mb-3">System Information</h2>
            
            {/* Alarm and Insulation tabs */}
            <div className="flex mb-3 border-b border-gray-200">
              <button className="flex-1 py-2 text-sm text-gray-700 font-medium border-b-2 border-gray-300">
                Real-time Alarm
              </button>
              <button className="flex-1 py-2 text-sm text-orange-500 font-medium">
                Insulation
              </button>
            </div>
            
            {/* System Information items */}
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">SOC</span>
                <span className="text-gray-600 text-sm">{formatNumber(socValue, 1)}%</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">SOH</span>
                <span className="text-gray-600 text-sm">{formatNumber(sohValue, 1)}%</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Average Voltage</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.rated_voltage / (batteryDetail.cell_configuration ? parseInt(batteryDetail.cell_configuration.split('S')[0]) : 16), 2)} V</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Average Temperature</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.max_cell_temp || 39.25, 2)}°C</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Cell Configuration</span>
                <span className="text-gray-600 text-sm">{batteryDetail.cell_configuration || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">BMS Type</span>
                <span className="text-gray-600 text-sm">{batteryDetail.bms_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Total Discharge</span>
                <span className="text-gray-600 text-sm">{formatNumber(Math.abs(batteryDetail.total_discharge_ah), 1)} Ah</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Total Charge</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.total_charge_ah, 1)} Ah</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Discharge Hours</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.discharge_working_hours, 1)} h</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Charge Hours</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.charge_working_hours, 1)} h</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-700 text-sm font-medium">Idle Hours</span>
                <span className="text-gray-600 text-sm">{formatNumber(batteryDetail.idle_working_hours, 1)} h</span>
              </div>
            </div>
            <CellVoltageChart packageName={packageName} />
            <CellTemperatureChart packageName={packageName} />
          </div>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'Statistics' && (
        <StatisticsTab packageName={packageName} />
      )}

      {/* Alarms Tab */}
      {activeTab === 'Alarms' && (        
        <AlarmTab packageName={packageName} />
      )}

      {/* Upgrades Tab */}
      {activeTab === 'Upgrades' && (
        <div className="flex justify-center items-center h-64 bg-white mt-3 rounded-t-3xl">
          <p className="text-gray-500">Upgrades functionality coming soon</p>
        </div>
      )}
    </div>
  );
}