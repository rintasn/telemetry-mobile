// _components/scanner/power-meter-preview.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PowerMeterPreviewProps } from './types';
import { formatUtils } from './types';

export const PowerMeterPreview: React.FC<PowerMeterPreviewProps> = ({ 
  data, 
  loading, 
  onBack, 
  onBind 
}) => {
  const { formatNumber, formatDate } = formatUtils;

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="font-medium text-purple-700 mb-2">Power Meter Details</h3>
        
        <div className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">📊</span>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{data.package_name}</h4>
            <p className="text-sm text-gray-500">Power Measurement Unit</p>
            
            {data.status_binding === "1" && (
              <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Already bound to a user
              </div>
            )}
          </div>
          
          {/* Power meter specs */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Phase Voltage (V)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Phase 1-N</p>
                <p className="font-medium">{formatNumber(data.v1n)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Phase 2-N</p>
                <p className="font-medium">{formatNumber(data.v2n)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Phase 3-N</p>
                <p className="font-medium">{formatNumber(data.v3n)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 col-span-3">
                <p className="text-xs text-gray-500 mb-1">Average VLN</p>
                <p className="font-medium">{formatNumber(data.avg_vln)} V</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Line Voltage (V)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">V1-2</p>
                <p className="font-medium">{formatNumber(data.v12)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">V2-3</p>
                <p className="font-medium">{formatNumber(data.v23)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">V3-1</p>
                <p className="font-medium">{formatNumber(data.v31)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 col-span-3">
                <p className="text-xs text-gray-500 mb-1">Average VLL</p>
                <p className="font-medium">{formatNumber(data.avg_vll)} V</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current (A)</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Current 1</p>
                <p className="font-medium">{formatNumber(data.cur1)} A</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Current 2</p>
                <p className="font-medium">{formatNumber(data.cur2)} A</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Current 3</p>
                <p className="font-medium">{formatNumber(data.cur3)} A</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Avg Current</p>
                <p className="font-medium">{formatNumber(data.avg_cur)} A</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Power (kW/kVA)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total kW</p>
                <p className="font-medium">{formatNumber(data.total_kw)} kW</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total kVA</p>
                <p className="font-medium">{formatNumber(data.total_kva)} kVA</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Power Factor</p>
                <p className="font-medium">{formatNumber(data.avg_pf)}</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Frequency</p>
                <p className="font-medium">{formatNumber(data.freq)} Hz</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">kWh</p>
                <p className="font-medium">{formatNumber(data.kwh)} kWh</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">kVAh</p>
                <p className="font-medium">{formatNumber(data.kvah)} kVAh</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Last Update</p>
            <p className="font-medium text-xs">{formatDate(data.updated_at)}</p>
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
          {loading ? 'Binding...' : 'Confirm & Bind Power Meter'}
        </Button>
      </div>
      
      {data.status_binding === "1" && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>
            This power meter appears to be already bound to a user. You cannot bind it again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};