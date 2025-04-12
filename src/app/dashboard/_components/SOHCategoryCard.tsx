// components/dashboard/SOHCategoryCard.tsx
import { Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SOHCategoriesType {
  critical: number;
  poor: number;
  fair: number;
  good: number;
  excellent: number;
  unknown: number;
}

interface SOHCategoryCardProps {
  sohCategories: SOHCategoriesType;
  validSohCount: number;
}

export function SOHCategoryCard({ sohCategories, validSohCount }: SOHCategoryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">State of Health</h3>
          <Leaf className="h-5 w-5 text-green-500" />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Critical</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Exc</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            {validSohCount > 0 ? (
              <>
                <div 
                  className="bg-red-500" 
                  style={{ 
                    width: `${sohCategories.critical / validSohCount * 100}%`,
                    minWidth: sohCategories.critical > 0 ? '8px' : '0'
                  }}
                  title={`Critical: ${sohCategories.critical}`}
                ></div>
                <div 
                  className="bg-orange-400" 
                  style={{ 
                    width: `${sohCategories.poor / validSohCount * 100}%`,
                    minWidth: sohCategories.poor > 0 ? '8px' : '0'
                  }}
                  title={`Poor: ${sohCategories.poor}`}
                ></div>
                <div 
                  className="bg-yellow-400" 
                  style={{ 
                    width: `${sohCategories.fair / validSohCount * 100}%`,
                    minWidth: sohCategories.fair > 0 ? '8px' : '0'
                  }}
                  title={`Fair: ${sohCategories.fair}`}
                ></div>
                <div 
                  className="bg-green-400" 
                  style={{ 
                    width: `${sohCategories.good / validSohCount * 100}%`,
                    minWidth: sohCategories.good > 0 ? '8px' : '0'
                  }}
                  title={`Good: ${sohCategories.good}`}
                ></div>
                <div 
                  className="bg-green-600" 
                  style={{ 
                    width: `${sohCategories.excellent / validSohCount * 100}%`,
                    minWidth: sohCategories.excellent > 0 ? '8px' : '0'
                  }}
                  title={`Excellent: ${sohCategories.excellent}`}
                ></div>
              </>
            ) : (
              <div className="bg-gray-300 w-full" title="No valid SOH data available"></div>
            )}
          </div>
          <div className="mt-2 flex justify-between">
            <div className="text-center">
              <span className="text-lg font-bold">{validSohCount}</span>
              <span className="text-xs text-gray-500 block">Valid</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold">{sohCategories.unknown}</span>
              <span className="text-xs text-gray-500 block">Not Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}