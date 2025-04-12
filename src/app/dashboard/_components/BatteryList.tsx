// components/dashboard/BatteryList.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BatteryCard } from "./BatteryCard";

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

interface BatteryListProps {
  data: BatteryData[];
}

export function BatteryList({ data }: BatteryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Battery List</CardTitle>
        <CardDescription>
          List of all batteries with their basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((battery, index) => (
            <BatteryCard 
              key={battery.serial_number || index} 
              battery={battery} 
              index={index} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}