// app/_components/PowerMeterExcelDownload.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx';

interface PowerMeterExcelDownloadProps {
  packageName: string;
  className?: string;
}

const PowerMeterExcelDownload: React.FC<PowerMeterExcelDownloadProps> = ({
  packageName,
  className,
}) => {
const { toast } = useToast()
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7)) // Default to 7 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format dates for display
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "dd MMMM yyyy");
  };

  // Format dates for API
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  // Download Excel function
  const downloadExcel = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get token
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format dates for API
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);

      // Build URL with query parameters
      const url = `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail_power_meter_history?package_name=${packageName}&start_date=${startDateStr}&end_date=${endDateStr}`;

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        toast({
          title: "No data available",
          description: "There is no data for the selected time period",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      // Process data for Excel
      const processedData = data.map(item => ({
        "Date Time": new Date(item.created_at),
        "V1-N (V)": item.v1n.toFixed(2),
        "V2-N (V)": item.v2n.toFixed(2),
        "V3-N (V)": item.v3n.toFixed(2),
        "Avg VLN (V)": item.avg_vln.toFixed(2),
        "V1-2 (V)": item.v12.toFixed(2),
        "V2-3 (V)": item.v23.toFixed(2),
        "V3-1 (V)": item.v31.toFixed(2),
        "Avg VLL (V)": item.avg_vll.toFixed(2),
        "Current 1 (A)": item.cur1.toFixed(2),
        "Current 2 (A)": item.cur2.toFixed(2),
        "Current 3 (A)": item.cur3.toFixed(2),
        "Avg Current (A)": item.avg_cur.toFixed(2),
        "kW 1": item.kw1.toFixed(2),
        "kW 2": item.kw2.toFixed(2),
        "kW 3": item.kw3.toFixed(2),
        "kVA 1": item.kva1.toFixed(2),
        "kVA 2": item.kva2.toFixed(2),
        "kVA 3": item.kva3.toFixed(2),
        "Total kW": item.total_kw.toFixed(2),
        "Total kVA": item.total_kva.toFixed(2),
        "Average PF": item.avg_pf.toFixed(2),
        "Frequency (Hz)": item.freq.toFixed(2),
        "kWh": item.kwh.toFixed(2),
        "kVAh": item.kvah.toFixed(2),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 },  // Date Time
        { wch: 10 },  // V1-N
        { wch: 10 },  // V2-N
        // ... Add width for each column
      ];
      worksheet['!cols'] = colWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${packageName} Data`);

      // Create file name with date range
      const fileName = `${packageName}_PowerMeter_${formatDateForAPI(startDate)}_to_${formatDateForAPI(endDate)}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Download Complete",
        description: `Data has been exported to ${fileName}`,
        variant: "default",
      });
      
      setOpen(false);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Download Failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${className}`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export to Excel</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Power Meter Data</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="package">Package Name</Label>
              <Input 
                id="package" 
                value={packageName} 
                readOnly 
                className="bg-gray-100"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDateForDisplay(startDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDateForDisplay(endDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={downloadExcel} 
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading || !startDate || !endDate}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PowerMeterExcelDownload;