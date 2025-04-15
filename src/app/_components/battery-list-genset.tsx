// app/_components/battery-list-genset.tsx
import React, { useState } from 'react';
import { 
  Cable, 
  Zap, 
  Battery, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Activity,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Update the interface to match the API response
interface GensetData {
  package_name: string;
  status_package: string;
  status_pln: string;
  status_genset: string;
  v_pln_r: number;
  v_pln_s: number;
  v_pln_t: number;
  v_genset_r: number;
  v_genset_s: number;
  v_genset_t: number;
  a_pln_r: number;
  a_pln_s: number;
  a_pln_t: number;
  a_genset_r: number;
  a_genset_s: number;
  a_genset_t: number;
  kw_pln_r: number;
  kw_pln_s: number;
  kw_pln_t: number;
  kw_genset_r: number;
  kw_genset_s: number;
  kw_genset_t: number;
  kwh_pln_r: number;
  kwh_pln_s: number;
  kwh_pln_t: number;
  kwh_genset_r: number;
  kwh_genset_s: number;
  kwh_genset_t: number;
  fq_pln_r: number;
  fq_pln_s: number;
  fq_pln_t: number;
  fq_genset_r: number;
  fq_genset_s: number;
  fq_genset_t: number;
  pf_pln_r: number;
  pf_pln_s: number;
  pf_pln_t: number;
  pf_genset_r: number;
  pf_genset_s: number;
  pf_genset_t: number;
  updated_at: string;
}

interface GensetListProps {
  genset: GensetData[];
}

const GensetList: React.FC<GensetListProps> = ({ genset }) => {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

  // Helper function to determine status
  const getStatusDetails = (status: string) => {
    switch (status) {
      case '1':
        return { 
          color: 'bg-green-500', 
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          text: 'Active' 
        };
      case '0':
        return { 
          color: 'bg-red-500', 
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          text: 'Inactive' 
        };
      default:
        return { 
          color: 'bg-gray-400', 
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          text: 'Unknown' 
        };
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Subtract 7 hours (7 * 60 * 60 * 1000 milliseconds)
      const adjustedDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(adjustedDate);
    } catch {
      return 'Invalid date';
    }
  };

  // Toggle package expansion
  const togglePackageExpansion = (packageName: string) => {
    setExpandedPackage(prev => prev === packageName ? null : packageName);
  };

  // Toggle details expansion (for quick view)
  const toggleDetailsExpansion = (event: React.MouseEvent, packageName: string) => {
    event.stopPropagation();
    setExpandedDetails(prev => prev === packageName ? null : packageName);
  };

  // Calculate total power for a package
  const calculateTotalPower = (item: GensetData, source: 'pln' | 'genset') => {
    if (source === 'pln') {
      return item.kw_pln_r + item.kw_pln_s + item.kw_pln_t;
    } else {
      return item.kw_genset_r + item.kw_genset_s + item.kw_genset_t;
    }
  };

  // Calculate average frequency
  const calculateAvgFrequency = (item: GensetData, source: 'pln' | 'genset') => {
    if (source === 'pln') {
      return (item.fq_pln_r + item.fq_pln_s + item.fq_pln_t) / 3;
    } else {
      return (item.fq_genset_r + item.fq_genset_s + item.fq_genset_t) / 3;
    }
  };

  // Calculate average power factor
  const calculateAvgPowerFactor = (item: GensetData, source: 'pln' | 'genset') => {
    if (source === 'pln') {
      return (item.pf_pln_r + item.pf_pln_s + item.pf_pln_t) / 3;
    } else {
      return (item.pf_genset_r + item.pf_genset_s + item.pf_genset_t) / 3;
    }
  };

  // Calculate average voltage
  const calculateAvgVoltage = (item: GensetData, source: 'pln' | 'genset') => {
    if (source === 'pln') {
      return (item.v_pln_r + item.v_pln_s + item.v_pln_t) / 3;
    } else {
      return (item.v_genset_r + item.v_genset_s + item.v_genset_t) / 3;
    }
  };

  // Render gauge component for power visualization
  const renderPowerGauge = (power: number, maxPower: number = 100, source: 'pln' | 'genset') => {
    const percentage = Math.min((power / maxPower) * 100, 100);
    const gaugeColor = source === 'pln' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600';
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-gray-500">{source === 'pln' ? 'PLN Power' : 'Genset Power'}</p>
          <p className="text-xs font-medium">{power.toFixed(2)} kW</p>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gaugeColor} rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render parameter card for quick view
  const renderParameterCard = (label: string, value: number, unit: string, icon: React.ReactNode, bgColor: string = 'bg-white/60') => (
    <div className={`${bgColor} backdrop-blur-sm p-3 rounded-xl border border-blue-100`}>
      <p className="text-xs text-blue-500 mb-1 font-medium flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold">{value.toFixed(2)} {unit}</p>
    </div>
  );

  // Render detailed parameter row for expanded view
  const renderParameterRow = (label: string, plnValues: number[], gensetValues: number[], unit: string = '') => (
    <div className="grid grid-cols-7 gap-2 py-2 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="col-span-1 flex items-center font-medium text-gray-700">
        {label}
      </div>
      {[...plnValues, ...gensetValues].map((value, index) => (
        <div 
          key={index} 
          className={`text-center ${
            index < 3 ? 'text-blue-600' : 'text-green-600'
          } font-semibold`}
        >
          {value.toFixed(2)}{unit}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header info */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {genset.length} power management systems
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs font-medium text-gray-600">PLN</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs font-medium text-gray-600">Genset</span>
          </div>
        </div>
      </div>

      {/* Genset cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {genset.map((item, index) => {
          const plnStatus = getStatusDetails(item.status_pln);
          const gensetStatus = getStatusDetails(item.status_genset);
          const isExpanded = expandedDetails === item.package_name;
          
          // Calculate summary values
          const totalPlnPower = calculateTotalPower(item, 'pln');
          const totalGensetPower = calculateTotalPower(item, 'genset');
          
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
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${plnStatus.color} bg-opacity-20 ${plnStatus.textColor}`}>
                      <div className={`w-2 h-2 rounded-full ${plnStatus.color} mr-1`}></div>
                      PLN
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${gensetStatus.color} bg-opacity-20 ${gensetStatus.textColor}`}>
                      <div className={`w-2 h-2 rounded-full ${gensetStatus.color} mr-1`}></div>
                      Genset
                    </div>
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
                          strokeDasharray={`${2 * Math.PI * 40 * (totalPlnPower / 200)} ${2 * Math.PI * 40 * (1 - totalPlnPower / 200)}`}
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
                          strokeDasharray={`${2 * Math.PI * 30 * (totalGensetPower / 200)} ${2 * Math.PI * 30 * (1 - totalGensetPower / 200)}`}
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
                          {totalPlnPower.toFixed(1)}
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
                          {totalGensetPower.toFixed(1)}
                        </text>
                        <text
                          x="50"
                          y="80"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fontSize="8"
                          fill="#6b7280"
                        >
                          kW TOTAL
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <CardContent className="px-6 pb-6">
                  {/* Genset Details */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">{item.package_name}</h3>
                      <p className="text-sm text-gray-500">Power Management System</p>
                    </div>
                    
                    {/* Power gauges */}
                    <div className="space-y-2">
                      {renderPowerGauge(totalPlnPower, 200, 'pln')}
                      {renderPowerGauge(totalGensetPower, 200, 'genset')}
                    </div>
                    
                    {/* Quick status info */}
                    <div className="flex justify-between px-1 mb-3 bg-blue-50/50 py-1 rounded-lg text-xs">
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 text-blue-500 mr-1" />
                        <span>{calculateAvgVoltage(item, 'pln').toFixed(1)} V</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="w-3 h-3 text-blue-500 mr-1" />
                        <span>{calculateAvgFrequency(item, 'pln').toFixed(1)} Hz</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart2 className="w-3 h-3 text-blue-500 mr-1" />
                        <span>PF {calculateAvgPowerFactor(item, 'pln').toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Parameter cards with expand toggle */}
                    <div className="grid grid-cols-2 gap-4 relative">
                      <div className="absolute -top-2 right-0">
                        <button 
                          onClick={(e) => toggleDetailsExpansion(e, item.package_name)}
                          className="bg-blue-100 p-1 rounded-full hover:bg-blue-200 transition-colors duration-200 focus:outline-none"
                          title="Show more details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            {isExpanded ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        </button>
                      </div>
                      
                      {renderParameterCard(
                        "Voltage PLN", 
                        calculateAvgVoltage(item, 'pln'),
                        "V",
                        <Zap className="w-3 h-3" />
                      )}
                      
                      {renderParameterCard(
                        "Voltage Genset", 
                        calculateAvgVoltage(item, 'genset'),
                        "V",
                        <Zap className="w-3 h-3" />
                      )}
                      
                      {renderParameterCard(
                        "Frequency PLN", 
                        calculateAvgFrequency(item, 'pln'),
                        "Hz",
                        <Activity className="w-3 h-3" />
                      )}
                      
                      {renderParameterCard(
                        "Frequency Genset", 
                        calculateAvgFrequency(item, 'genset'),
                        "Hz",
                        <Activity className="w-3 h-3" />
                      )}
                      
                      {/* Expanded details section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            className="col-span-2 mt-3 grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {renderParameterCard(
                              "PF PLN", 
                              calculateAvgPowerFactor(item, 'pln'),
                              "",
                              <BarChart2 className="w-3 h-3" />
                            )}
                            
                            {renderParameterCard(
                              "PF Genset", 
                              calculateAvgPowerFactor(item, 'genset'),
                              "",
                              <BarChart2 className="w-3 h-3" />
                            )}
                            
                            {renderParameterCard(
                              "Current PLN R", 
                              item.a_pln_r,
                              "A",
                              <Zap className="w-3 h-3" />
                            )}
                            
                            {renderParameterCard(
                              "Current Genset R", 
                              item.a_genset_r,
                              "A",
                              <Zap className="w-3 h-3" />
                            )}
                            
                            {renderParameterCard(
                              "Energy PLN", 
                              item.kwh_pln_r + item.kwh_pln_s + item.kwh_pln_t,
                              "kWh",
                              <Battery className="w-3 h-3" />
                            )}
                            
                            {renderParameterCard(
                              "Energy Genset", 
                              item.kwh_genset_r + item.kwh_genset_s + item.kwh_genset_t,
                              "kWh",
                              <Battery className="w-3 h-3" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
        {expandedPackage && genset.map((item, index) => {
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
                  <Button
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-100"
                    onClick={() => togglePackageExpansion(item.package_name)}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2 font-semibold text-gray-600 border-b pb-2">
                  <div className="col-span-1"></div>
                  <div className="text-center text-blue-500">PLN R</div>
                  <div className="text-center text-blue-500">PLN S</div>
                  <div className="text-center text-blue-500">PLN T</div>
                  <div className="text-center text-green-500">Genset R</div>
                  <div className="text-center text-green-500">Genset S</div>
                  <div className="text-center text-green-500">Genset T</div>
                </div>

                {renderParameterRow('Voltage (V)', 
                  [item.v_pln_r, item.v_pln_s, item.v_pln_t], 
                  [item.v_genset_r, item.v_genset_s, item.v_genset_t]
                )}

                {renderParameterRow('Current (A)', 
                  [item.a_pln_r, item.a_pln_s, item.a_pln_t], 
                  [item.a_genset_r, item.a_genset_s, item.a_genset_t]
                )}

                {renderParameterRow('Power (kW)', 
                  [item.kw_pln_r, item.kw_pln_s, item.kw_pln_t], 
                  [item.kw_genset_r, item.kw_genset_s, item.kw_genset_t]
                )}

                {renderParameterRow('Energy (kWh)', 
                  [item.kwh_pln_r, item.kwh_pln_s, item.kwh_pln_t], 
                  [item.kwh_genset_r, item.kwh_genset_s, item.kwh_genset_t]
                )}

                {renderParameterRow('Frequency (Hz)', 
                  [item.fq_pln_r, item.fq_pln_s, item.fq_pln_t], 
                  [item.fq_genset_r, item.fq_genset_s, item.fq_genset_t]
                )}

                {renderParameterRow('Power Factor', 
                  [item.pf_pln_r, item.pf_pln_s, item.pf_pln_t], 
                  [item.pf_genset_r, item.pf_genset_s, item.pf_genset_t]
                )}

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

export default GensetList;