// components/dashboard/UtilizationCard.tsx
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UtilizationCardProps {
  activeTimePercentage: number;
}

export function UtilizationCard({ activeTimePercentage }: UtilizationCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Battery Utilization</h3>
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">{Math.round(activeTimePercentage)}%</span>
          <span className="text-sm text-gray-500">Active Time</span>
        </div>
      </CardContent>
    </Card>
  );
}