// app/_components/battery-list-power-meter.tsx
import React, { useState } from 'react';
import { 
  Cable, 
  Zap, 
  Battery, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Activity,
  BarChart2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PowerMeterExcelDownload from "./PowerMeterExcelDownload";

// Updated interface to match the API response
interface PowerMeterData {
  created_at: string;
  updated_at: string;
  v1n: number;
  v2n: number;
  v3n: number;
  avg_vln: number;
  v12: number;
  v23: number;
  v31: number;
  avg_vll: number;
  cur1: number;
  cur2: number;
  cur3: number;
  avg_cur: number;
  kw1: number;
  kw2: number;
  kw3: number;
  kva1: number;
  kva2: number;
  kva3: number;
  total_kw: number;
  total_kva: number;
  avg_pf: number;
  freq: number;
  kwh: number;
  kvah: number;
  package_name: string;
}

interface PowerMeterListProps {
  powerMeter: PowerMeterData[];
}

const PowerMeterList: React.FC<PowerMeterListProps> = ({ powerMeter }) => {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  // Function to toggle package expansion
  const togglePackageExpansion = (packageName: string) => {
    if (expandedPackage === packageName) {
      setExpandedPackage(null);
    } else {
      setExpandedPackage(packageName);
    }
  };

  // Function to format the date
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

  // Function to calculate power percentage
  const calculatePowerPercentage = (kw: number): number => {
    // Assuming 10kW is 100% for this example
    // Adjust according to real requirements
    const maxPower = 10;
    return Math.min(kw / maxPower, 1);
  };

  // Function to determine the status (normal, warning, critical)
  const getPowerStatus = (kw: number, avg_pf: number): 'normal' | 'warning' | 'critical' => {
    if (avg_pf < 0.85) return 'critical';
    if (kw > 8) return 'warning'; // Adjust according to real requirements
    return 'normal';
  };

  // Get color for status
  const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header info */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {powerMeter.length} Power Meter Data
        </div>
      </div>

      {/* Power meter cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {powerMeter.map((item, index) => {
          // Calculate percentages and states
          const plnPowerPercentage = calculatePowerPercentage(item.total_kw);
          const gensetPowerPercentage = 0.3; // Default value for visualization
          const powerStatus = getPowerStatus(item.total_kw, item.avg_pf);
          const statusColor = getStatusColor(powerStatus);
                    
          return (
            <motion.div
              key={`${item.package_name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
              className="cursor-pointer"
              onClick={() => togglePackageExpansion(item.package_name)}
            >
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-blue-50 rounded-2xl">
                {/* Package Header */}
                <div className="relative">
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {powerStatus === 'critical' && (
                      <div className="bg-red-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    {powerStatus === 'warning' && (
                      <div className="bg-yellow-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Package icon and name */}
                  <div className="flex justify-center pt-8 pb-2">
                    <div className="relative w-32 h-16 bg-blue-900/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-100">
                      <div className="absolute w-4 h-8 bg-blue-900/10 -right-2 top-4 rounded-r-md"></div>
                      <div className="w-28 h-12 rounded-md bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium">{item.package_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Power Visualization */}
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-24 h-24" viewBox="0 0 100 100">
                        {/* PLN Power Arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40 * (plnPowerPercentage)} ${2 * Math.PI * 40 * (1 - plnPowerPercentage)}`}
                          strokeDashoffset={2 * Math.PI * 40 * 0.25} // Start from the top
                          strokeLinecap="round"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          stroke="#22c55e"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 30 * (gensetPowerPercentage)} ${2 * Math.PI * 30 * (1 - gensetPowerPercentage)}`}
                          strokeDashoffset={2 * Math.PI * 30 * 0.25} // Start from the top
                          strokeLinecap="round"
                        />
                        <text
                          x="50"
                          y="38"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fontSize="12"
                          fill="#3b82f6"
                          fontWeight="bold"
                        >
                          {item.total_kw.toFixed(1)}kW
                        </text>
                        <text
                          x="50"
                          y="62"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fontSize="12"
                          fill="#22c55e"
                          fontWeight="bold"
                        >
                          {(item.total_kva).toFixed(1)}kVA
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <CardContent className="px-6 pb-6">
                  {/* Power Meter Details */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">{item.package_name}</h3>
                      <p className="text-sm text-gray-500">Power Management System</p>
                    </div>
                    
                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-xs font-medium text-gray-600">PF</span>
                          </div>
                          <span className={`text-xs font-bold ${item.avg_pf < 0.85 ? 'text-red-500' : 'text-blue-500'}`}>
                            {item.avg_pf.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-xs font-medium text-gray-600">Freq</span>
                          </div>
                          <span className="text-xs font-bold text-blue-500">
                            {item.freq.toFixed(1)} Hz
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Battery className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-xs font-medium text-gray-600">kWh</span>
                          </div>
                          <span className="text-xs font-bold text-blue-500">
                            {item.kwh.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BarChart2 className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-xs font-medium text-gray-600">kVAh</span>
                          </div>
                          <span className="text-xs font-bold text-blue-500">
                            {item.kvah.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Last updated info */}
                    <div className="mt-4 flex items-center justify-end text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      <span>Updated: {formatDate(item.updated_at)}</span>
                    </div>
                    
                    {/* View details button */}
                    <Button className="w-full py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2 mt-2">
                      <span>View Full Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Package Details */}
      <AnimatePresence>
        {expandedPackage && powerMeter.map((item, index) => {
          if (item.package_name === expandedPackage) {
            return (
              <motion.div
                key={`expanded-${item.package_name}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 mt-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Cable className="w-5 h-5 text-blue-500 mr-2" />
                    Detailed Data: {item.package_name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {/* Excel Download Button */}
                    <PowerMeterExcelDownload 
                      packageName={item.package_name}
                      className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                    />
                    
                    {/* Collapse Button */}
                    <Button
                      variant="outline"
                      className="text-gray-600 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePackageExpansion(item.package_name);
                      }}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Detailed data sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Voltage Section */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="text-md font-semibold text-blue-700 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Voltages
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                        <span className="text-sm text-gray-600">V1-2:</span>
                        <span className="text-sm font-medium">{item.v12.toFixed(1)} V</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                        <span className="text-sm text-gray-600">V2-3:</span>
                        <span className="text-sm font-medium">{item.v23.toFixed(1)} V</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                        <span className="text-sm text-gray-600">V3-1:</span>
                        <span className="text-sm font-medium">{item.v31.toFixed(1)} V</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-semibold text-blue-700">Average:</span>
                        <span className="text-sm font-semibold text-blue-700">{item.avg_vll.toFixed(1)} V</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Section */}
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h3 className="text-md font-semibold text-green-700 mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Currents
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-green-100 pb-1">
                        <span className="text-sm text-gray-600">I1:</span>
                        <span className="text-sm font-medium">{item.cur1.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-green-100 pb-1">
                        <span className="text-sm text-gray-600">I2:</span>
                        <span className="text-sm font-medium">{item.cur2.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-green-100 pb-1">
                        <span className="text-sm text-gray-600">I3:</span>
                        <span className="text-sm font-medium">{item.cur3.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-semibold text-green-700">Average:</span>
                        <span className="text-sm font-semibold text-green-700">{item.avg_cur.toFixed(2)} A</span>
                      </div>
                    </div>
                  </div>

                  {/* Power Section */}
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h3 className="text-md font-semibold text-purple-700 mb-3 flex items-center">
                      <Battery className="w-4 h-4 mr-2" />
                      Power
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-1">
                        <span className="text-sm text-gray-600">Active power:</span>
                        <span className="text-sm font-medium">{item.total_kw.toFixed(2)} kW</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-1">
                        <span className="text-sm text-gray-600">Apparent power:</span>
                        <span className="text-sm font-medium">{item.total_kva.toFixed(2)} kVA</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-1">
                        <span className="text-sm text-gray-600">Power factor:</span>
                        <span className={`text-sm font-medium ${item.avg_pf < 0.85 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.avg_pf.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-semibold text-purple-700">Frequency:</span>
                        <span className="text-sm font-semibold text-purple-700">{item.freq.toFixed(2)} Hz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy Section */}
                <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Energy
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active energy:</span>
                        <span className="text-sm font-bold text-blue-600">{item.kwh.toFixed(2)} kWh</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Apparent energy:</span>
                        <span className="text-sm font-bold text-purple-600">{item.kvah.toFixed(2)} kVAh</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Last Updated */}
                <div className="mt-4 flex items-center justify-end text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Last Updated: {formatDate(item.updated_at)}</span>
                </div>
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>
    </div>
  );
};

export default PowerMeterList;