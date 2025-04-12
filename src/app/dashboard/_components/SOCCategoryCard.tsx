// components/dashboard/SOCCategoryCard.tsx
import { BatteryFull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SOCCategoriesType {
  critical: number;
  low: number;
  medium: number;
  high: number;
  full: number;
  unknown: number;
}

interface SOCCategoryCardProps {
  socCategories: SOCCategoriesType;
  validSocCount: number;
}

export function SOCCategoryCard({ socCategories, validSocCount }: SOCCategoryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">State of Charge</h3>
          <BatteryFull className="h-5 w-5 text-green-500" />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Critical</span>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Full</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            {validSocCount > 0 ? (
              <>
                <div 
                  className="bg-red-500" 
                  style={{ 
                    width: `${socCategories.critical / validSocCount * 100}%`,
                    minWidth: socCategories.critical > 0 ? '8px' : '0'
                  }}
                  title={`Critical: ${socCategories.critical}`}
                ></div>
                <div 
                  className="bg-orange-400" 
                  style={{ 
                    width: `${socCategories.low / validSocCount * 100}%`,
                    minWidth: socCategories.low > 0 ? '8px' : '0'
                  }}
                  title={`Low: ${socCategories.low}`}
                ></div>
                <div 
                  className="bg-yellow-400" 
                  style={{ 
                    width: `${socCategories.medium / validSocCount * 100}%`,
                    minWidth: socCategories.medium > 0 ? '8px' : '0'
                  }}
                  title={`Medium: ${socCategories.medium}`}
                ></div>
                <div 
                  className="bg-green-400" 
                  style={{ 
                    width: `${socCategories.high / validSocCount * 100}%`,
                    minWidth: socCategories.high > 0 ? '8px' : '0'
                  }}
                  title={`High: ${socCategories.high}`}
                ></div>
                <div 
                  className="bg-green-600" 
                  style={{ 
                    width: `${socCategories.full / validSocCount * 100}%`,
                    minWidth: socCategories.full > 0 ? '8px' : '0'
                  }}
                  title={`Full: ${socCategories.full}`}
                ></div>
              </>
            ) : (
              <div className="bg-gray-300 w-full" title="No valid SOC data available"></div>
            )}
          </div>
          <div className="mt-2 flex justify-between">
            <div className="text-center">
              <span className="text-lg font-bold">{validSocCount}</span>
              <span className="text-xs text-gray-500 block">Valid</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold">{socCategories.unknown}</span>
              <span className="text-xs text-gray-500 block">Not Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}