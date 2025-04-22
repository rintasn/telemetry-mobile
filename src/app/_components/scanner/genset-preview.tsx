// _components/scanner/genset-preview.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GensetPreviewProps } from './types';
import { formatUtils } from './types';

export const GensetPreview: React.FC<GensetPreviewProps> = ({ 
  data, 
  loading, 
  onBack, 
  onBind 
}) => {
  const { formatNumber, formatDate } = formatUtils;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <h3 className="font-medium text-green-700 mb-2">Genset Details</h3>
        
        <div className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-lg p-4 border border-green-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">⚡</span>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{data.package_name}</h4>
            <p className="text-sm text-gray-500">Power Generation Unit</p>
            
            {data.status_binding === "1" && (
              <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Already bound to a user
              </div>
            )}
          </div>
          
          {/* PLN Status */}
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">PLN Status</p>
            <p className="font-medium">{data.status_pln === "1" ? "Active" : "Inactive"}</p>
          </div>
          
          {/* Genset specs */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">PLN Voltage (V)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">R Phase</p>
                <p className="font-medium">{formatNumber(data.v_pln_r)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">S Phase</p>
                <p className="font-medium">{formatNumber(data.v_pln_s)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">T Phase</p>
                <p className="font-medium">{formatNumber(data.v_pln_t)} V</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Genset Voltage (V)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">R Phase</p>
                <p className="font-medium">{formatNumber(data.v_genset_r)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">S Phase</p>
                <p className="font-medium">{formatNumber(data.v_genset_s)} V</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">T Phase</p>
                <p className="font-medium">{formatNumber(data.v_genset_t)} V</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Power Consumption (kWh)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">PLN Total</p>
                <p className="font-medium">
                  {(parseFloat(formatNumber(data.kwh_pln_r)) + 
                    parseFloat(formatNumber(data.kwh_pln_s)) + 
                    parseFloat(formatNumber(data.kwh_pln_t))).toFixed(3)} kWh
                </p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Genset Total</p>
                <p className="font-medium">
                  {(parseFloat(formatNumber(data.kwh_genset_r)) + 
                    parseFloat(formatNumber(data.kwh_genset_s)) + 
                    parseFloat(formatNumber(data.kwh_genset_t))).toFixed(3)} kWh
                </p>
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
          {loading ? 'Binding...' : 'Confirm & Bind Genset'}
        </Button>
      </div>
      
      {data.status_binding === "1" && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>
            This genset appears to be already bound to a user. You cannot bind it again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};