// _components/battery-list.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// FilterDialog Component
import FilterDialog from './filter-dialog';

// Define the battery data structure
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

interface BatteryListProps {
  batteries: BatteryData[];
}

// Sort type for the dropdown
type SortOption = {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
};

// Filter type for the active/inactive filter
type ActivityFilter = 'all' | 'active' | 'inactive';

const BatteryList: React.FC<BatteryListProps> = ({ batteries }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>({
    value: 'package_name',
    label: 'Name (A-Z)',
    direction: 'asc'
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [expandedBatteryId, setExpandedBatteryId] = useState<string | null>(null);
  
  // Define sort options
  const sortOptions: SortOption[] = [
    { value: 'package_name', label: 'Name (A-Z)', direction: 'asc' },
    { value: 'package_name', label: 'Name (Z-A)', direction: 'desc' },
    { value: 'updated_at', label: 'Recently Updated', direction: 'desc' },
    { value: 'soc', label: 'Charge Level (High-Low)', direction: 'desc' },
    { value: 'soc', label: 'Charge Level (Low-High)', direction: 'asc' }
  ];
  
  // Filter and sort batteries
  const filteredBatteries = batteries
    .filter(battery => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        battery.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Activity filter
      const batteryActive = battery.status_binding === '1';
      const matchesActivity = 
        activityFilter === 'all' || 
        (activityFilter === 'active' && batteryActive) || 
        (activityFilter === 'inactive' && !batteryActive);
        
      return matchesSearch && matchesActivity;
    })
    .sort((a, b) => {
      const key = sortOption.value as keyof BatteryData;
      const direction = sortOption.direction === 'asc' ? 1 : -1;
      
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      // Handle numeric values
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return (Number(aValue) - Number(bValue)) * direction;
      }
      
      // Handle date values for updated_at
      if (key === 'updated_at') {
        return (new Date(aValue).getTime() - new Date(bValue).getTime()) * direction;
      }
      
      // Default string comparison
      return aValue.localeCompare(bValue) * direction;
    });
  
  // Handle applying filters from the dialog
  const handleApplyFilters = (filters: {
    searchTerm: string;
    activityFilter: ActivityFilter;
    sortOption: SortOption;
  }) => {
    setSearchTerm(filters.searchTerm);
    setActivityFilter(filters.activityFilter);
    setSortOption(filters.sortOption);
    setIsFilterDialogOpen(false);
  };
  
  // Handle battery card click
  const handleBatteryClick = (batteryId: string) => {
    router.push(`/battery/${batteryId}`);
  };
  
  // Handle expand details toggle
  const handleExpandToggle = (event: React.MouseEvent, batteryId: string) => {
    event.stopPropagation(); // Prevent card click from triggering
    setExpandedBatteryId(expandedBatteryId === batteryId ? null : batteryId);
  };
  
  // Calculate SOC percentage safely
  const calculateSocPercentage = (socValue: string): number => {
    const soc = parseFloat(socValue);
    if (isNaN(soc)) return 0;
    return Math.min(Math.max(soc, 0), 100);
  };
  
  // Convert minutes to hours
  const minutesToHours = (minutes: string): number => {
    const mins = parseFloat(minutes);
    if (isNaN(mins)) return 0;
    return mins / 60; // Convert minutes to hours
  };
  
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

  // Get status color based on SOC
  const getStatusColor = (socValue: string): string => {
    const soc = parseFloat(socValue);
    if (isNaN(soc)) return 'bg-gray-400';
    
    if (soc >= 75) return 'bg-green-500';
    if (soc >= 40) return 'bg-yellow-500';
    if (soc > 15) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div>
      {/* Simplified filter controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredBatteries.length} of {batteries.length} devices
        </div>
        
        <Button
          onClick={() => setIsFilterDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-2 bg-white/20 backdrop-blur-md border-blue-200 hover:bg-blue-50 transition-all duration-300"
        >
          <span className="text-blue-500">🔍</span>
          <span>Filter & Sort</span>
          {(searchTerm || activityFilter !== 'all') && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              ✓
            </span>
          )}
        </Button>
      </div>
      
      {/* Filter dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={{
          searchTerm,
          activityFilter,
          sortOption
        }}
        sortOptions={sortOptions}
      />
      
      {/* Display no results message */}
      {filteredBatteries.length === 0 && (
        <div className="p-8 text-center rounded-lg bg-blue-50 border border-blue-100">
          <div className="text-6xl mb-4">🔋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Batteries Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || activityFilter !== 'all' 
              ? "Try adjusting your filters to see more results." 
              : "No batteries have been bound to your account yet."}
          </p>
          {(searchTerm || activityFilter !== 'all') && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setActivityFilter('all');
                setSortOption(sortOptions[0]);
              }}
              className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
      
      {/* Battery cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBatteries.map((battery, index) => {
          const socPercentage = calculateSocPercentage(battery.soc);
          const isActive = battery.status_binding === '1';
          
          return (
            <motion.div
              key={`${battery.package_name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
              className="cursor-pointer"
              onClick={() => handleBatteryClick(battery.package_name)}
            >
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-blue-50 rounded-2xl">
                <div className="relative">
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4 flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs font-medium text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  {/* Battery image or icon */}
                  <div className="flex justify-center pt-8 pb-2">
                    <div className="relative w-32 h-16 bg-blue-900/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-100">
                      <div className="absolute w-4 h-8 bg-blue-900/10 -right-2 top-4 rounded-r-md"></div>
                      <div className="w-28 h-12 rounded-md bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium">{battery.package_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Battery SOC Gauge - Futuristic circular gauge */}
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-24 h-24" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Foreground progress */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={socPercentage > 15 ? (socPercentage > 40 ? (socPercentage > 75 ? "#22c55e" : "#eab308") : "#f97316") : "#ef4444"}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40 * (socPercentage / 100)} ${2 * Math.PI * 40 * (1 - socPercentage / 100)}`}
                          strokeDashoffset={2 * Math.PI * 40 * 0.25} // Start from the top
                          strokeLinecap="round"
                        />
                        <text
                          x="50"
                          y="50"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fontSize="20"
                          fontWeight="bold"
                          fill="#374151"
                        >
                          {socPercentage}%
                        </text>
                        <text
                          x="50"
                          y="65"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          Charge
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <CardContent className="px-6 pb-6">
                  {/* Battery Details */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">{battery.package_name}</h3>
                      <p className="text-sm text-gray-500">{battery.brand || "Unknown Brand"}</p>
                    </div>
                    
                    {/* Additional info row */}
                    <div className="flex justify-between text-xs text-gray-500 px-1 mb-2">
                      <div>
                        <span className="mr-1">SN:</span>
                        <span className="font-medium">{battery.serial_number || "N/A"}</span>
                      </div>
                      <div>
                        <span className="mr-1">v</span>
                        <span className="font-medium">{battery.software_version || "N/A"}</span>
                      </div>
                    </div>
                    
                    {/* Battery real-time data */}
                    <div className="flex justify-between px-1 mb-3 bg-blue-50/50 py-1 rounded-lg text-xs">
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-1">⚡</span>
                        <span>{parseFloat(battery.batt_volt || "0").toFixed(2)} V</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-1">↯</span>
                        <span>{parseFloat(battery.batt_cur || "0").toFixed(2)} A</span>
                      </div>
                    </div>
                    {/* Battery specs with custom styling and expand toggle */}
                    <div className="grid grid-cols-2 gap-4 relative">
                      <div className="absolute -top-2 right-0">
                        <button 
                          onClick={(e) => handleExpandToggle(e, battery.package_name)}
                          className="bg-blue-100 p-1 rounded-full hover:bg-blue-200 transition-colors duration-200 focus:outline-none"
                          title="Show more details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            {expandedBatteryId === battery.package_name ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        </button>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1 font-medium">Voltage</p>
                        <p className="text-sm font-semibold">{battery.rated_voltage || "N/A"} V</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1 font-medium">Capacity</p>
                        <p className="text-sm font-semibold">{battery.rated_capacity || "N/A"} Ah</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1 font-medium">Charge Cycles</p>
                        <p className="text-sm font-semibold">{battery.charging_cycle || "0"}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1 font-medium">Last Update</p>
                        <p className="text-xs font-semibold">{formatDate(battery.updated_at)}</p>
                      </div>
                      
                      {/* Expanded details section */}
                      {expandedBatteryId === battery.package_name && (
                        <motion.div 
                          className="col-span-2 mt-3 grid grid-cols-2 gap-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Software Version</p>
                            <p className="text-sm font-semibold">{battery.software_version || "N/A"}</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Brand</p>
                            <p className="text-sm font-semibold">{battery.brand || "N/A"}</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Working Hours</p>
                            <p className="text-sm font-semibold">{minutesToHours(battery.working_hour_telemetri || "0").toFixed(1)} h</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Charging Hours</p>
                            <p className="text-sm font-semibold">{minutesToHours(battery.charge_working_hours || "0").toFixed(1)} h</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Max Cell Volt</p>
                            <p className="text-sm font-semibold">{battery.max_cell_volt || "N/A"} V (Cell {battery.max_cv_no || "N/A"})</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Min Cell Volt</p>
                            <p className="text-sm font-semibold">{battery.min_cell_volt || "N/A"} V (Cell {battery.min_cv_no || "N/A"})</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Max Cell Temp</p>
                            <p className="text-sm font-semibold">{battery.max_cell_temp || "N/A"} °C</p>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 mb-1 font-medium">Current</p>
                            <p className="text-sm font-semibold">{battery.batt_cur || "N/A"} A</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Working Hours bar - Visual indicator of usage */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-500">Working Hours</p>
                        <p className="text-xs font-medium">{minutesToHours(battery.working_hour_telemetri || "0").toFixed(1)} h</p>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ 
                            width: `${Math.min((minutesToHours(battery.working_hour_telemetri || "0") / 10000) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">0h</p>
                        <p className="text-xs text-gray-400">10,000h</p>
                      </div>
                    </div>
                    
                    {/* View details button */}
                    <button className="w-full py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2 mt-2">
                      <span>View Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BatteryList;