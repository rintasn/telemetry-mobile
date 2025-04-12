// components/dashboard/BatteryStatusCard.tsx
import { Battery } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BatteryStatusCardProps {
  totalBatteries: number;
  activeBatteries: number;
}

export function BatteryStatusCard({ totalBatteries, activeBatteries }: BatteryStatusCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Battery Status</h3>
          <Battery className="h-5 w-5 text-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{totalBatteries}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{activeBatteries}</span>
            <span className="text-sm text-gray-500">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}