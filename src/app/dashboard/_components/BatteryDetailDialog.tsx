// components/dashboard/BatteryDetailDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Wifi } from "lucide-react";
  
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
    latitude: number;
    longitude: number;
    signal: number;
  }
  
  interface BatteryDetailDialogProps {
    battery: BatteryData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  // Helper function to get signal quality text
  function getSignalQuality(signal: number): string {
    if (signal === undefined || signal === null || signal <= 0) return "No Signal";
    if (signal <= 7) return "Poor";
    if (signal <= 15) return "Fair";
    if (signal <= 23) return "Good";
    return "Excellent";
  }
  
  // Helper function to get signal quality color class
  function getSignalColorClass(signal: number): string {
    if (signal === undefined || signal === null || signal <= 0) return "text-gray-500";
    if (signal <= 7) return "text-red-600";
    if (signal <= 15) return "text-orange-600";
    if (signal <= 23) return "text-green-600";
    return "text-blue-600";
  }
  
  export function BatteryDetailDialog({ battery, open, onOpenChange }: BatteryDetailDialogProps) {
    const hasLocation = 
      battery.latitude !== undefined && 
      battery.longitude !== undefined && 
      (battery.latitude !== 0 || battery.longitude !== 0);
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Signal Quality:</span>
                  <span className={getSignalColorClass(battery.signal)}>
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 mr-1" />
                      {getSignalQuality(battery.signal)} ({battery.signal})
                    </div>
                  </span>
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
          
          {/* Location info if available */}
          {hasLocation && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Location Information</h3>
              <div className="h-48 border rounded-md overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${battery.latitude},${battery.longitude}&z=15&output=embed`}
                  title={`Location of Battery ${battery.package_name}`}
                ></iframe>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Latitude: {battery.latitude}</span>
                <span>Longitude: {battery.longitude}</span>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Raw Data</h3>
            <div className="border rounded-md p-3 bg-gray-50 overflow-auto max-h-60">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(battery, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }