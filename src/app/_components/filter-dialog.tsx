// _components/filter-dialog.tsx
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sort type for the dropdown
type SortOption = {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
};

// Filter type for the active/inactive filter
type ActivityFilter = 'all' | 'active' | 'inactive';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    searchTerm: string;
    activityFilter: ActivityFilter;
    sortOption: SortOption;
  }) => void;
  initialFilters: {
    searchTerm: string;
    activityFilter: ActivityFilter;
    sortOption: SortOption;
  };
}

const FilterDialog: React.FC<FilterDialogProps> = ({ 
  open, 
  onClose, 
  onApplyFilters,
  initialFilters 
}) => {
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>(initialFilters.activityFilter);
  const [sortOption, setSortOption] = useState<SortOption>(initialFilters.sortOption);

  // Sort options
  const sortOptions: SortOption[] = [
    { value: 'updated_at_desc', label: 'Last Updated (Newest)', direction: 'desc' },
    { value: 'updated_at_asc', label: 'Last Updated (Oldest)', direction: 'asc' },
    { value: 'soc_desc', label: 'State of Charge (High-Low)', direction: 'desc' },
    { value: 'soc_asc', label: 'State of Charge (Low-High)', direction: 'asc' },
    { value: 'package_name_asc', label: 'Package Name (A-Z)', direction: 'asc' },
    { value: 'package_name_desc', label: 'Package Name (Z-A)', direction: 'desc' },
  ];

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters({
      searchTerm,
      activityFilter,
      sortOption
    });
    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    setSearchTerm('');
    setActivityFilter('all');
    setSortOption({ 
      value: 'updated_at_desc', 
      label: 'Last Updated (Newest)', 
      direction: 'desc' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Batteries</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Package name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Sort options */}
          <div className="space-y-2">
            <Label htmlFor="sort">Sort by</Label>
            <select
              id="sort"
              value={sortOption.value}
              onChange={(e) => {
                const option = sortOptions.find(opt => opt.value === e.target.value);
                if (option) setSortOption(option);
              }}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Activity filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex space-x-2">
              <Button
                onClick={() => setActivityFilter('all')}
                variant={activityFilter === 'all' ? 'default' : 'outline'}
                className={`flex-1 ${activityFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                All
              </Button>
              <Button
                onClick={() => setActivityFilter('active')}
                variant={activityFilter === 'active' ? 'default' : 'outline'}
                className={`flex-1 ${activityFilter === 'active' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Active
              </Button>
              <Button
                onClick={() => setActivityFilter('inactive')}
                variant={activityFilter === 'inactive' ? 'default' : 'outline'}
                className={`flex-1 ${activityFilter === 'inactive' ? 'bg-gray-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="space-x-2 flex">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;