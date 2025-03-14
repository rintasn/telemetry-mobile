// _components/battery-list.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FilterDialog from './filter-dialog';
import { useRouter } from 'next/navigation';

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
  // State for expanded battery details
  const [expandedBattery, setExpandedBattery] = useState<string | null>(null);
  const router = useRouter();
  
  // State for filter dialog
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>({ 
    value: 'updated_at_desc', 
    label: 'Last Updated (Newest)', 
    direction: 'desc' 
  });
  
  // Filtered and sorted data
  const [filteredBatteries, setFilteredBatteries] = useState<BatteryData[]>(batteries);

  // Function to check if a battery is active (updated within last 3 days)
  const isBatteryActive = (battery: BatteryData): boolean => {
    const updateDate = new Date(battery.updated_at);
    const currentDate = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    
    return updateDate >= threeDaysAgo;
  };

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    let result = [...batteries];
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        battery => 
          battery.package_name.toLowerCase().includes(lowercaseSearch) ||
          battery.serial_number.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Apply activity filter
    if (activityFilter !== 'all') {
      result = result.filter(battery => {
        const active = isBatteryActive(battery);
        return activityFilter === 'active' ? active : !active;
      });
    }
    
    // Apply sorting
    const [field, direction] = sortOption.value.split('_');
    if (field) {
      result.sort((a, b) => {
        // Get values based on field
        let valueA, valueB;
        
        if (field === 'updated_at') {
          valueA = new Date(a.updated_at).getTime();
          valueB = new Date(b.updated_at).getTime();
        } else if (field === 'soc') {
          valueA = parseFloat(a.soc) || 0;
          valueB = parseFloat(b.soc) || 0;
        } else if (field === 'package_name') {
          valueA = a.package_name.toLowerCase();
          valueB = b.package_name.toLowerCase();
          return direction === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        // Compare values
        if (direction === 'asc') {
          return (valueA as number) - (valueB as number);
        } else {
          return (valueB as number) - (valueA as number);
        }
      });
    }
    
    setFilteredBatteries(result);
  }, [batteries, searchTerm, activityFilter, sortOption]);

  // Handle applying filters from dialog
  const handleApplyFilters = (filters: {
    searchTerm: string;
    activityFilter: ActivityFilter;
    sortOption: SortOption;
  }) => {
    setSearchTerm(filters.searchTerm);
    setActivityFilter(filters.activityFilter);
    setSortOption(filters.sortOption);
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Toggle expanded state for a battery card
  const toggleExpand = (serialNumber: string) => {
    if (expandedBattery === serialNumber) {
      setExpandedBattery(null);
    } else {
      setExpandedBattery(serialNumber);
    }
  };

  // Format numeric values with specified decimals
  const formatNumber = (value: string, decimals: number = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(decimals);
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
          className="flex items-center gap-2"
        >
          <span>🔍</span>
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
      />
      
      {/* Display no results message */}
      {filteredBatteries.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500 font-medium">No batteries match your filters</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setActivityFilter('all');
              setSortOption({ 
                value: 'updated_at_desc', 
                label: 'Last Updated (Newest)', 
                direction: 'desc' 
              });
            }}
            className="mt-4 bg-blue-500"
          >
            Reset Filters
          </Button>
        </div>
      )}
      
      {/* Battery cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBatteries.map((battery) => (
          <div 
            key={battery.serial_number} 
            className={`bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${
              expandedBattery === battery.serial_number ? 'shadow-lg' : ''
            } ${!isBatteryActive(battery) ? 'border-l-4 border-l-gray-400' : 'border-l-4 border-l-green-500'}`}
          >
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                isBatteryActive(battery) ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'
              }`}>
                <span>🔋</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{battery.package_name}</h3>
                <p className="text-sm text-gray-500">{battery.serial_number}</p>
                <p className="text-xs text-gray-400">
                  {isBatteryActive(battery) ? 
                    <span className="text-green-500 font-medium">Active</span> : 
                    <span className="text-gray-500">Inactive</span>
                  }
                </p>
              </div>
              <button 
                onClick={() => toggleExpand(battery.serial_number)}
                className="text-blue-500 hover:text-blue-700"
              >
                {expandedBattery === battery.serial_number ? '▲' : '▼'}
              </button>
            </div>
            
            {/* Battery live status */}
            <div className="mb-4 grid grid-cols-2 gap-2 bg-blue-50 p-3 rounded">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-700">
                  {battery.soc === "0" ? "N/A" : `${formatNumber(battery.soc)}%`}
                </div>
                <div className="text-xs text-gray-600">State of Charge</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-700">
                  {battery.batt_volt === "0" ? "N/A" : `${formatNumber(battery.batt_volt)}V`}
                </div>
                <div className="text-xs text-gray-600">Voltage</div>
              </div>
              <div className="text-center col-span-2">
                <div className="font-bold text-lg text-blue-700">
                  {battery.batt_cur === "0" ? "N/A" : `${formatNumber(battery.batt_cur)}A`}
                </div>
                <div className="text-xs text-gray-600">Current</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2 py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Manufacturer:</span> {battery.manufacturer}
              </div>
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Brand:</span> {battery.brand}
              </div>
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Status:</span> {
                  battery.status_binding === "1" ? 
                  <span className="text-green-500 font-medium">Connected</span> : 
                  <span className="text-gray-500">Disconnected</span>
                }
              </div>
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Voltage:</span> {battery.rated_voltage}V
              </div>
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Capacity:</span> {battery.rated_capacity}Ah
              </div>
              
              {/* Additional visible info */}
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">SW Version:</span> {battery.software_version}
              </div>
              <div className="py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Cycles:</span> {battery.cycle_charge}
              </div>
              <div className="col-span-2 py-1 px-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Last Updated:</span> {formatDate(battery.updated_at)}
              </div>
            </div>
            
            {/* Expanded info */}
            {expandedBattery === battery.serial_number && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-700 mb-2">Battery Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Energy:</span> {battery.rated_energy}kWh
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Charge Cycles:</span> {battery.charging_cycle}
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Max Cell V:</span> {battery.max_cell_volt}V
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Min Cell V:</span> {battery.min_cell_volt}V
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Cell Temp:</span> {battery.max_cell_temp}°C
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Energy Wh:</span> {formatNumber(battery.batt_wh)}
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Discharge Hrs:</span> {formatNumber(battery.discharge_working_hours)}
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Charge Hrs:</span> {formatNumber(battery.charge_working_hours)}
                  </div>
                  <div className="py-1 px-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Idle Hrs:</span> {formatNumber(battery.idle_working_hours)}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors"
                onClick={() => router.push(`/battery/${battery.package_name}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatteryList;