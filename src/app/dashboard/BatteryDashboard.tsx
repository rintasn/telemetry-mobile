// components/BatteryDashboard.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Battery, BatteryFull, ArrowLeft, Clock, Leaf, Thermometer, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Link from 'next/link'

// Menggunakan interface BatteryData yang sama dari page.tsx
interface BatteryData {
  package_name: string;
  id_user: string;
  status_binding: string;
  serial_number: string;
  manufacturer: string;
  brand: string;
  rated_voltage: string;
  rated_capacity: string;
  rated_energy: string;
  discharge_working_hours: string;
  charge_working_hours: string;
  idle_working_hours: string;
  cycle_charge: string;
  total_discharge_ah: string;
  batt_wh_charge: string;
  batt_wh_discharge: string;
  charging_cycle: string;
  total_charge_ah: string;
  batt_volt: string;
  batt_cur: string;
  soc: string;
  soh: string;
  max_cell_volt: string;
  max_cv_no: string;
  min_cell_volt: string;
  min_cv_no: string;
  max_cell_temp: string;
  batt_wh: string;
  batt_ah: string;
  working_hour_telemetri: string;
  charging_hour_telemetri: string;
  software_version: string;
  updated_at: string;
}

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
  // State untuk dialog raw data
  const [selectedBattery, setSelectedBattery] = useState<BatteryData | null>(null);

  // Kalkulasi summary data untuk executive management
  const summaryData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 1. Status Baterai
    const totalBatteries = data.length;
    const activeBatteries = data.filter(b => b.status_binding === "1").length;
    const activeBatteriesPercentage = (activeBatteries / totalBatteries) * 100;

    // 2. SOC Categories (untuk baterai yang aktif)
    const activeBatteriesWithSoc = data.filter(b => b.status_binding === "1");
    // Baterai aktif dengan nilai SOC yang valid (bukan 0)
    const validSocBatteries = activeBatteriesWithSoc.filter(b => parseFloat(b.soc) > 0);
    const validSocCount = validSocBatteries.length;
    
    const socCategories = {
      critical: 0,  // 0-20%
      low: 0,       // 21-40%
      medium: 0,    // 41-60%
      high: 0,      // 61-80%
      full: 0,      // 81-100%
      unknown: 0    // Tidak ada data (termasuk nilai 0)
    };

    activeBatteriesWithSoc.forEach(battery => {
      const socValue = parseFloat(battery.soc);
      if (isNaN(socValue) || socValue <= 0) {
        socCategories.unknown++;
      } else if (socValue <= 20) {
        socCategories.critical++;
      } else if (socValue <= 40) {
        socCategories.low++;
      } else if (socValue <= 60) {
        socCategories.medium++;
      } else if (socValue <= 80) {
        socCategories.high++;
      } else {
        socCategories.full++;
      }
    });

    // 3. SOH Categories (untuk baterai yang aktif)
    // Baterai aktif dengan nilai SOH yang valid (bukan 0)
    const validSohBatteries = activeBatteriesWithSoc.filter(b => parseFloat(b.soh) > 0);
    const validSohCount = validSohBatteries.length;
    
    const sohCategories = {
      critical: 0,  // 0-40%
      poor: 0,      // 41-70%
      fair: 0,      // 71-85%
      good: 0,      // 86-95%
      excellent: 0, // 96-100%
      unknown: 0    // Tidak ada data (termasuk nilai 0)
    };

    activeBatteriesWithSoc.forEach(battery => {
      const sohValue = parseFloat(battery.soh);
      if (isNaN(sohValue) || sohValue <= 0) {
        sohCategories.unknown++;
      } else if (sohValue <= 40) {
        sohCategories.critical++;
      } else if (sohValue <= 70) {
        sohCategories.poor++;
      } else if (sohValue <= 85) {
        sohCategories.fair++;
      } else if (sohValue <= 95) {
        sohCategories.good++;
      } else {
        sohCategories.excellent++;
      }
    });

    // Untuk nilai rata-rata (masih berguna untuk beberapa kasus)
    const avgSoc = validSocBatteries.length 
      ? validSocBatteries.reduce((acc, curr) => acc + parseFloat(curr.soc), 0) / validSocBatteries.length 
      : 0;

    const avgSoh = validSohBatteries.length 
      ? validSohBatteries.reduce((acc, curr) => acc + parseFloat(curr.soh), 0) / validSohBatteries.length 
      : 0;

    // 4. Total charging cycle
    const totalChargingCycle = data.reduce((acc, curr) => acc + parseFloat(curr.charging_cycle || "0"), 0);
    const avgChargingCycle = totalChargingCycle / totalBatteries;

    // 5. Energi
    const totalChargeWh = data.reduce((acc, curr) => acc + parseFloat(curr.batt_wh_charge || "0"), 0);
    const totalDischargeWh = data.reduce((acc, curr) => acc + parseFloat(curr.batt_wh_discharge || "0"), 0);
    const energyEfficiency = totalDischargeWh !== 0 
      ? Math.abs((totalChargeWh / Math.abs(totalDischargeWh)) * 100) 
      : 0;

    // 6. Utilitas
    const totalWorkingHours = data.reduce((acc, curr) => {
      const discharge = parseFloat(curr.discharge_working_hours || "0");
      const charge = parseFloat(curr.charge_working_hours || "0");
      const idle = parseFloat(curr.idle_working_hours || "0");
      return acc + discharge + charge + idle;
    }, 0);

    const totalActiveHours = data.reduce((acc, curr) => {
      const discharge = parseFloat(curr.discharge_working_hours || "0");
      const charge = parseFloat(curr.charge_working_hours || "0");
      return acc + discharge + charge;
    }, 0);

    const activeTimePercentage = (totalActiveHours / totalWorkingHours) * 100;

    // 7. Suhu maksimum
    const maxTemp = Math.max(...data.map(b => parseFloat(b.max_cell_temp || "0")));

    // 8. Distribusi Brand
    const brandDistribution = data.reduce((acc: Record<string, number>, curr) => {
      const brand = curr.brand || "Not Active";
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    // 9. Kapasitas rata-rata
    const avgCapacity = data.reduce((acc, curr) => acc + parseFloat(curr.rated_capacity || "0"), 0) / totalBatteries;

    // 10. Software versions distribution
    const softwareVersions = data.reduce((acc: Record<string, number>, curr) => {
      const version = curr.software_version || "Not Active";
      acc[version] = (acc[version] || 0) + 1;
      return acc;
    }, {});
    
    // 11. Estimated Battery Lifetime (berdasarkan SOH dan charging cycle)
    const estimatedLifetime = activeBatteriesWithSoc
      .filter(b => parseFloat(b.soh) > 0 && parseFloat(b.charging_cycle) > 0)
      .map(b => {
        const soh = parseFloat(b.soh);
        const chargingCycle = parseFloat(b.charging_cycle);
        // Asumsi: degradasi linier dan EOL pada SOH = 70%
        if (soh > 70 && chargingCycle > 0) {
          const remainingHealth = soh - 70; // Presentase SOH yang tersisa hingga EOL
          const degrationRate = (100 - soh) / chargingCycle; // Pengurangan SOH per siklus
          return degrationRate > 0 ? remainingHealth / degrationRate : 0; // Siklus tersisa
        }
        return 0;
      });
    
    const avgEstimatedCycles = estimatedLifetime.length > 0 
      ? estimatedLifetime.reduce((acc, curr) => acc + curr, 0) / estimatedLifetime.length
      : 0;

    return {
      totalBatteries,
      activeBatteries,
      activeBatteriesPercentage,
      validSocCount,
      validSohCount,
      socCategories,
      sohCategories,
      avgSoc,
      avgSoh,
      avgChargingCycle,
      energyEfficiency,
      totalWorkingHours,
      activeTimePercentage,
      maxTemp,
      brandDistribution,
      avgCapacity,
      softwareVersions,
      avgEstimatedCycles,
    };
  }, [data]);

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Executive Dashboard</h2>
          <p className="text-gray-500">Summary of battery fleet performance and statistics</p>
          <Link className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-50" href="/home"><ArrowLeft className="h-4 w-4" />Home</Link>

        </div>
        
        {/* Raw Data Viewer Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              <Database className="h-4 w-4" />
              <span>View Raw Data</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Raw Battery Data</DialogTitle>
              <DialogDescription>
                Raw data from API for debugging and analysis purposes
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              <pre className="text-xs p-4 bg-gray-50 rounded-md">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Battery Status</h3>
              <Battery className="h-5 w-5 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{summaryData.totalBatteries}</span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{summaryData.activeBatteries}</span>
                <span className="text-sm text-gray-500">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">State of Charge</h3>
              <BatteryFull className="h-5 w-5 text-green-500" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Critical</span>
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Full</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                {summaryData.validSocCount > 0 ? (
                  <>
                    <div 
                      className="bg-red-500" 
                      style={{ 
                        width: `${summaryData.socCategories.critical / summaryData.validSocCount * 100}%`,
                        minWidth: summaryData.socCategories.critical > 0 ? '8px' : '0'
                      }}
                      title={`Critical: ${summaryData.socCategories.critical}`}
                    ></div>
                    <div 
                      className="bg-orange-400" 
                      style={{ 
                        width: `${summaryData.socCategories.low / summaryData.validSocCount * 100}%`,
                        minWidth: summaryData.socCategories.low > 0 ? '8px' : '0'
                      }}
                      title={`Low: ${summaryData.socCategories.low}`}
                    ></div>
                    <div 
                      className="bg-yellow-400" 
                      style={{ 
                        width: `${summaryData.socCategories.medium / summaryData.validSocCount * 100}%`,
                        minWidth: summaryData.socCategories.medium > 0 ? '8px' : '0'
                      }}
                      title={`Medium: ${summaryData.socCategories.medium}`}
                    ></div>
                    <div 
                      className="bg-green-400" 
                      style={{ 
                        width: `${summaryData.socCategories.high / summaryData.validSocCount * 100}%`,
                        minWidth: summaryData.socCategories.high > 0 ? '8px' : '0'
                      }}
                      title={`High: ${summaryData.socCategories.high}`}
                    ></div>
                    <div 
                      className="bg-green-600" 
                      style={{ 
                        width: `${summaryData.socCategories.full / summaryData.validSocCount * 100}%`,
                        minWidth: summaryData.socCategories.full > 0 ? '8px' : '0'
                      }}
                      title={`Full: ${summaryData.socCategories.full}`}
                    ></div>
                  </>
                ) : (
                  <div className="bg-gray-300 w-full" title="No valid SOC data available"></div>
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <div className="text-center">
                  <span className="text-lg font-bold">{summaryData.validSocCount}</span>
                  <span className="text-xs text-gray-500 block">Valid</span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold">{summaryData.socCategories.unknown}</span>
                  <span className="text-xs text-gray-500 block">Not Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">State of Health</h3>
              <Leaf className="h-5 w-5 text-green-500" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Critical</span>
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Exc</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                {summaryData.validSohCount > 0 ? (
                  <>
                    <div 
                      className="bg-red-500" 
                      style={{ 
                        width: `${summaryData.sohCategories.critical / summaryData.validSohCount * 100}%`,
                        minWidth: summaryData.sohCategories.critical > 0 ? '8px' : '0'
                      }}
                      title={`Critical: ${summaryData.sohCategories.critical}`}
                    ></div>
                    <div 
                      className="bg-orange-400" 
                      style={{ 
                        width: `${summaryData.sohCategories.poor / summaryData.validSohCount * 100}%`,
                        minWidth: summaryData.sohCategories.poor > 0 ? '8px' : '0'
                      }}
                      title={`Poor: ${summaryData.sohCategories.poor}`}
                    ></div>
                    <div 
                      className="bg-yellow-400" 
                      style={{ 
                        width: `${summaryData.sohCategories.fair / summaryData.validSohCount * 100}%`,
                        minWidth: summaryData.sohCategories.fair > 0 ? '8px' : '0'
                      }}
                      title={`Fair: ${summaryData.sohCategories.fair}`}
                    ></div>
                    <div 
                      className="bg-green-400" 
                      style={{ 
                        width: `${summaryData.sohCategories.good / summaryData.validSohCount * 100}%`,
                        minWidth: summaryData.sohCategories.good > 0 ? '8px' : '0'
                      }}
                      title={`Good: ${summaryData.sohCategories.good}`}
                    ></div>
                    <div 
                      className="bg-green-600" 
                      style={{ 
                        width: `${summaryData.sohCategories.excellent / summaryData.validSohCount * 100}%`,
                        minWidth: summaryData.sohCategories.excellent > 0 ? '8px' : '0'
                      }}
                      title={`Excellent: ${summaryData.sohCategories.excellent}`}
                    ></div>
                  </>
                ) : (
                  <div className="bg-gray-300 w-full" title="No valid SOH data available"></div>
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <div className="text-center">
                  <span className="text-lg font-bold">{summaryData.validSohCount}</span>
                  <span className="text-xs text-gray-500 block">Valid</span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold">{summaryData.sohCategories.unknown}</span>
                  <span className="text-xs text-gray-500 block">Not Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Battery Utilization</h3>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{Math.round(summaryData.activeTimePercentage)}%</span>
              <span className="text-sm text-gray-500">Active Time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operational Statistics</CardTitle>
            <CardDescription>Key performance indicators and usage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Total Working Hours</span>
                <span className="font-medium">{Math.round(summaryData.totalWorkingHours).toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Average Charge Cycles</span>
                <span className="font-medium">{summaryData.avgChargingCycle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Average Capacity</span>
                <span className="font-medium">{Math.round(summaryData.avgCapacity)} Ah</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Energy Efficiency</span>
                <span className="font-medium">{Math.round(summaryData.energyEfficiency)}%</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Est. Remaining Cycles</span>
                <span className="font-medium">{Math.round(summaryData.avgEstimatedCycles)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Cell Temperature</span>
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 text-red-500 mr-1" />
                  <span className="font-medium">{summaryData.maxTemp}°C</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battery Distribution</CardTitle>
            <CardDescription>Distribution by brand and software version</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Brand Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(summaryData.brandDistribution).map(([brand, count]) => (
                    <div key={brand} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(count / summaryData.totalBatteries) * 100}%` }}
                        ></div>
                      </div>
                      <div className="ml-2 flex justify-between w-32">
                        <span className="text-xs text-gray-500">{brand}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Software Versions</h4>
                <div className="space-y-2">
                  {Object.entries(summaryData.softwareVersions).map(([version, count]) => (
                    <div key={version} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${(count / summaryData.totalBatteries) * 100}%` }}
                        ></div>
                      </div>
                      <div className="ml-2 flex justify-between w-32">
                        <span className="text-xs text-gray-500">{version}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Battery Cards */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Battery List</CardTitle>
            <CardDescription>
              List of all batteries with their basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {data && data.map((battery, index) => (
                <div key={battery.serial_number || index} className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{battery.package_name}</h3>
                      <p className="text-xs text-gray-500">{battery.serial_number}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${battery.status_binding === "1" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {battery.status_binding === "1" ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-2 font-medium">{battery.brand}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SOC:</span>
                        <span className="ml-2 font-medium">{battery.soc}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SOH:</span>
                        <span className="ml-2 font-medium">{battery.soh}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cycles:</span>
                        <span className="ml-2 font-medium">{battery.charging_cycle}</span>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="w-full mt-3 text-xs"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Battery Details: {battery.package_name}</DialogTitle>
                          <DialogDescription>
                            Serial Number: {battery.serial_number}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Basic Information</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className={battery.status_binding === "1" ? "text-green-600" : "text-red-600"}>
                                  {battery.status_binding === "1" ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Manufacturer:</span>
                                <span>{battery.manufacturer}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Brand:</span>
                                <span>{battery.brand}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Software Version:</span>
                                <span>{battery.software_version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(battery.updated_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Technical Specifications</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rated Voltage:</span>
                                <span>{battery.rated_voltage}V</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rated Capacity:</span>
                                <span>{battery.rated_capacity}Ah</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rated Energy:</span>
                                <span>{battery.rated_energy}kWh</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">SOC:</span>
                                <span>{battery.soc}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">SOH:</span>
                                <span>{battery.soh}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Usage Statistics</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Discharge Hours:</span>
                                <span>{parseFloat(battery.discharge_working_hours).toFixed(2)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Charge Hours:</span>
                                <span>{parseFloat(battery.charge_working_hours).toFixed(2)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Idle Hours:</span>
                                <span>{parseFloat(battery.idle_working_hours).toFixed(2)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Charging Cycles:</span>
                                <span>{battery.charging_cycle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Total Charge:</span>
                                <span>{parseFloat(battery.total_charge_ah).toFixed(2)}Ah</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Current Status</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Battery Voltage:</span>
                                <span>{battery.batt_volt}V</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Battery Current:</span>
                                <span>{battery.batt_cur}A</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Max Cell Voltage:</span>
                                <span>{battery.max_cell_volt}mV</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Min Cell Voltage:</span>
                                <span>{battery.min_cell_volt}mV</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Max Cell Temp:</span>
                                <span>{battery.max_cell_temp}°C</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* <div className="mt-6">
                          <h3 className="text-sm font-medium mb-2">Raw Data</h3>
                          <div className="border rounded-md p-3 bg-gray-50 overflow-auto max-h-60">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(battery, null, 2)}
                            </pre>
                          </div>
                        </div> */}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}