// components/dashboard/OperationalStats.tsx
import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OperationalStatsProps {
  totalWorkingHours: number;
  avgChargingCycle: number;
  avgCapacity: number;
  energyEfficiency: number;
  avgEstimatedCycles: number;
  maxTemp: number;
}

export function OperationalStats({
  totalWorkingHours,
  avgChargingCycle,
  avgCapacity,
  energyEfficiency,
  avgEstimatedCycles,
  maxTemp
}: OperationalStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Statistics</CardTitle>
        <CardDescription>Key performance indicators and usage metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Total Working Hours</span>
            <span className="font-medium">{Math.round(totalWorkingHours).toLocaleString()} hrs</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Average Charge Cycles</span>
            <span className="font-medium">{avgChargingCycle.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Average Capacity</span>
            <span className="font-medium">{Math.round(avgCapacity)} Ah</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Energy Efficiency</span>
            <span className="font-medium">{Math.round(energyEfficiency)}%</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Est. Remaining Cycles</span>
            <span className="font-medium">{Math.round(avgEstimatedCycles)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Max Cell Temperature</span>
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 text-red-500 mr-1" />
              <span className="font-medium">{maxTemp}°C</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}