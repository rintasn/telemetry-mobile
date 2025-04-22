// _components/scanner/scan-step.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanStepProps } from './types';

export const ScanStep: React.FC<ScanStepProps> = ({
  scanMode,
  onModeChange,
  scanResult,
  cameraStarted,
  error,
  loading,
  scannerContainerId,
  onToggleCamera,
  onInitScanner,
  onResetScan,
  onScanResult,
  manualInput,
  onManualInputChange,
  onSubmitManual,
  facingMode,
  deviceTypeName
}) => {
  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Tabs 
        defaultValue={scanMode} 
        onValueChange={(value) => onModeChange(value as any)} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="genset">Genset</TabsTrigger>
          <TabsTrigger value="power_meter">Power Meter</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* QR Scanner Section */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Scan QR Code</h3>
        <div className="flex flex-col items-center space-y-4">
          {!scanResult ? (
            <>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                {/* Scanner container */}
                <div 
                  id={scannerContainerId} 
                  style={{ width: '100%', minHeight: '250px', position: 'relative' }} 
                />
                
                {!cameraStarted && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                    <p>Starting camera...</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={onToggleCamera}
                  className="flex items-center space-x-1"
                  disabled={!cameraStarted}
                >
                  <span>Switch Camera</span>
                  <span>{facingMode === 'environment' ? '📷' : '🤳'}</span>
                </Button>
                
                {error && (
                  <Button 
                    onClick={onInitScanner}
                    className="flex items-center space-x-1"
                  >
                    Retry Camera
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Position the QR code within the frame to scan
              </p>
            </>
          ) : (
            <div className="w-full p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Scanned Package ID:</h3>
              <code className="block p-2 bg-white border rounded mb-4 overflow-x-auto">
                {scanResult}
              </code>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onResetScan} disabled={loading}>
                  Scan Again
                </Button>
                <Button 
                  onClick={() => onScanResult(scanResult)} 
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? 'Checking...' : 'Check Data'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="space-y-2 pt-2 border-t">
        <h3 className="font-medium text-sm">Manual Input</h3>
        <form onSubmit={onSubmitManual} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="packageId">Package ID</Label>
            <Input 
              id="packageId"
              value={manualInput}
              onChange={(e) => onManualInputChange(e.target.value)}
              placeholder={`Enter ${deviceTypeName.toLowerCase()} package ID manually`}
              required
            />
            <p className="text-xs text-gray-500">
              Enter the {scanMode} package ID exactly as it appears on the package
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            disabled={loading || !manualInput.trim()}
          >
            {loading ? 'Checking...' : 'Check Data'}
          </Button>
        </form>
      </div>
    </div>
  );
};