// components/dashboard/SignalQualityCard.tsx
import { Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SignalCategoriesType {
  poor: number;    // 0-7
  fair: number;    // 8-15
  good: number;    // 16-23
  excellent: number; // 24-31
}

interface SignalQualityCardProps {
  signalCategories: SignalCategoriesType;
  totalBatteries: number;
}

export function SignalQualityCard({ signalCategories, totalBatteries }: SignalQualityCardProps) {
  const totalSignalBatteries = 
    signalCategories.poor + 
    signalCategories.fair + 
    signalCategories.good + 
    signalCategories.excellent;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Signal Quality</h3>
          <Wifi className="h-5 w-5 text-blue-500" />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            {totalSignalBatteries > 0 ? (
              <>
                <div 
                  className="bg-red-500" 
                  style={{ 
                    width: `${signalCategories.poor / totalSignalBatteries * 100}%`,
                    minWidth: signalCategories.poor > 0 ? '8px' : '0'
                  }}
                  title={`Poor: ${signalCategories.poor}`}
                ></div>
                <div 
                  className="bg-orange-400" 
                  style={{ 
                    width: `${signalCategories.fair / totalSignalBatteries * 100}%`,
                    minWidth: signalCategories.fair > 0 ? '8px' : '0'
                  }}
                  title={`Fair: ${signalCategories.fair}`}
                ></div>
                <div 
                  className="bg-green-400" 
                  style={{ 
                    width: `${signalCategories.good / totalSignalBatteries * 100}%`,
                    minWidth: signalCategories.good > 0 ? '8px' : '0'
                  }}
                  title={`Good: ${signalCategories.good}`}
                ></div>
                <div 
                  className="bg-green-600" 
                  style={{ 
                    width: `${signalCategories.excellent / totalSignalBatteries * 100}%`,
                    minWidth: signalCategories.excellent > 0 ? '8px' : '0'
                  }}
                  title={`Excellent: ${signalCategories.excellent}`}
                ></div>
              </>
            ) : (
              <div className="bg-gray-300 w-full" title="No signal data available"></div>
            )}
          </div>
          <div className="mt-2 flex justify-between">
            <div className="text-center">
              <span className="text-lg font-bold">{totalSignalBatteries}</span>
              <span className="text-xs text-gray-500 block">With Signal</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold">{totalBatteries - totalSignalBatteries}</span>
              <span className="text-xs text-gray-500 block">No Signal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}