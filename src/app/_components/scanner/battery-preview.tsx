// _components/scanner/battery-preview.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BatteryPreviewProps } from './types';
import { formatUtils } from './types';

export const BatteryPreview: React.FC<BatteryPreviewProps> = ({ 
  data, 
  loading, 
  onBack, 
  onBind 
}) => {
  const { minutesToHours, formatDate } = formatUtils;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-700 mb-2">Battery Details</h3>
        
        <div className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">🔋</span>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{data.package_name}</h4>
            <p className="text-sm text-gray-500">{data.brand || data.manufacturer || "Unknown Brand"}</p>
            
            {data.status_binding === "1" && (
              <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Already bound to a user
              </div>
            )}
          </div>
          
          {/* Battery specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Serial Number</p>
              <p className="font-medium">{data.serial_number || "N/A"}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Software Version</p>
              <p className="font-medium">{data.software_version || "N/A"}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Rated Voltage</p>
              <p className="font-medium">{data.rated_voltage || "N/A"} V</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Rated Capacity</p>
              <p className="font-medium">{data.rated_capacity || "N/A"} Ah</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Current Voltage</p>
              <p className="font-medium">{parseFloat(data.batt_volt || "0").toFixed(2)} V</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">State of Charge</p>
              <p className="font-medium">{data.soc || "0"}%</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Working Hours</p>
              <p className="font-medium">{minutesToHours(data.working_hour_telemetri || "0")} h</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Last Update</p>
              <p className="font-medium text-xs">{formatDate(data.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation buttons */}
      <div className="flex justify-between pt-2 border-t">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Go Back
        </Button>
        <Button 
          onClick={onBind} 
          disabled={loading || data.status_binding === "1"}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {loading ? 'Binding...' : 'Confirm & Bind Battery'}
        </Button>
      </div>
      
      {data.status_binding === "1" && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>
            This battery appears to be already bound to a user. You cannot bind it again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};