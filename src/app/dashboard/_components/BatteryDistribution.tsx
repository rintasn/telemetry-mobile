// components/dashboard/BatteryDistribution.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BatteryDistributionProps {
  brandDistribution: Record<string, number>;
  softwareVersions: Record<string, number>;
  totalBatteries: number;
}

export function BatteryDistribution({
  brandDistribution,
  softwareVersions,
  totalBatteries
}: BatteryDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Battery Distribution</CardTitle>
        <CardDescription>Distribution by brand and software version</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Brand Distribution</h4>
            <div className="space-y-2">
              {Object.entries(brandDistribution).map(([brand, count]) => (
                <div key={brand} className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(count / totalBatteries) * 100}%` }}
                    ></div>
                  </div>
                  <div className="ml-2 flex justify-between w-32">
                    <span className="text-xs text-gray-500">{brand}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Software Versions</h4>
            <div className="space-y-2">
              {Object.entries(softwareVersions).map(([version, count]) => (
                <div key={version} className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${(count / totalBatteries) * 100}%` }}
                    ></div>
                  </div>
                  <div className="ml-2 flex justify-between w-32">
                    <span className="text-xs text-gray-500">{version}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}