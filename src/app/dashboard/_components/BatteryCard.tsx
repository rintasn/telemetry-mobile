// components/dashboard/BatteryCard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BatteryDetailDialog } from "./BatteryDetailDialog";

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

interface BatteryCardProps {
  battery: BatteryData;
  index: number;
}

export function BatteryCard({ battery, index }: BatteryCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="border rounded-md overflow-hidden">
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
            {battery.latitude && battery.longitude && (
              <div className="col-span-2 mt-1">
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 text-xs text-blue-500">Available</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline"
            size="sm" 
            className="w-full mt-3 text-xs"
            onClick={() => setDetailOpen(true)}
          >
            View Details
          </Button>
        </div>
      </div>

      <BatteryDetailDialog 
        battery={battery} 
        open={detailOpen} 
        onOpenChange={setDetailOpen}
      />
    </>
  );
}