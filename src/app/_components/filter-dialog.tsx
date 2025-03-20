// _components/filter-dialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  sortOptions: SortOption[];
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters,
  sortOptions
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>(initialFilters.activityFilter);
  const [sortOption, setSortOption] = useState<SortOption>(initialFilters.sortOption);

  // Reset filters when dialog opens with initial values
  useEffect(() => {
    if (open) {
      setSearchTerm(initialFilters.searchTerm);
      setActivityFilter(initialFilters.activityFilter);
      setSortOption(initialFilters.sortOption);
    }
  }, [open, initialFilters]);

  // Find sort option in the array
  const findSortOption = (value: string, direction: 'asc' | 'desc'): SortOption => {
    return sortOptions.find(
      option => option.value === value && option.direction === direction
    ) || sortOptions[0];
  };

  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    const [value, direction] = sortValue.split('-');
    setSortOption(findSortOption(value, direction as 'asc' | 'desc'));
  };

  // Handle apply button
  const handleApply = () => {
    onApplyFilters({
      searchTerm,
      activityFilter,
      sortOption
    });
  };

  // Handle reset button
  const handleReset = () => {
    setSearchTerm('');
    setActivityFilter('all');
    setSortOption(sortOptions[0]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filter & Sort Batteries</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Search filter */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Search by name, brand, serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-blue-200 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-blue-500">
                🔍
              </div>
            </div>
          </div>
          
          {/* Battery status filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Battery Status</Label>
            <RadioGroup 
              value={activityFilter} 
              onValueChange={(value) => setActivityFilter(value as ActivityFilter)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">All Batteries</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="cursor-pointer">Active Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="cursor-pointer">Inactive Only</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Sort options */}
          <div className="space-y-2">
            <Label htmlFor="sort" className="text-sm font-medium">Sort By</Label>
            <Select 
              value={`${sortOption.value}-${sortOption.direction}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger id="sort" className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Select a sort option" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem 
                    key={`${option.value}-${option.direction}`} 
                    value={`${option.value}-${option.direction}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Reset
          </Button>
          <Button 
            onClick={handleApply}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;