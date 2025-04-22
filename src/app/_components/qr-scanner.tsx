// _components/qr-scanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { BatteryPreview } from './scanner/battery-preview';
import { GensetPreview } from './scanner/genset-preview';
import { PowerMeterPreview } from './scanner/power-meter-preview';
import { ScanStep } from './scanner/scan-step';
import { BindingStep } from './scanner/binding-step';
import { 
  BatteryData, 
  GensetData, 
  PowerMeterData, 
  DeviceData, 
  ScanMode,
  QRScannerProps
} from './scanner/types';

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onSuccess }) => {
  const [scanMode, setScanMode] = useState<ScanMode>('battery');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [previewData, setPreviewData] = useState<DeviceData | null>(null);
  const [step, setStep] = useState<'scan' | 'preview' | 'binding'>('scan');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  // Initialize scanner when dialog opens
  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setScanResult(null);
      setManualInput('');
      setError(null);
      setLoading(false);
      setPreviewData(null);
      setStep('scan');
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeScanner();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        cleanupScanner();
      };
    } else {
      cleanupScanner();
    }
  }, [open]);

  // Handle camera changes
  useEffect(() => {
    if (open && scannerRef.current && cameraStarted) {
      // Stop current camera and restart with new facing mode
      scannerRef.current.stop()
        .then(() => {
          setCameraStarted(false);
          setTimeout(() => {
            startScanner();
          }, 300);
        })
        .catch(err => {
          console.error("Failed to stop camera:", err);
          setError("Failed to switch camera. Please try again.");
        });
    }
  }, [facingMode, open]);

  const initializeScanner = () => {
    // Clean up any existing instance
    cleanupScanner();
    
    // Check if container exists
    const container = document.getElementById(scannerContainerId);
    if (!container) {
      console.error("Scanner container not found");
      setError("Camera initialization failed. Please try again.");
      return;
    }

    try {
      // Create new scanner instance
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      startScanner();
    } catch (err) {
      console.error("Scanner initialization error:", err);
      setError("Failed to initialize camera scanner.");
    }
  };

  const cleanupScanner = () => {
    if (scannerRef.current && cameraStarted) {
      scannerRef.current.stop()
        .then(() => {
          setCameraStarted(false);
          scannerRef.current = null;
        })
        .catch(err => console.error("Failed to stop camera:", err));
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setError(null);
    
    try {
      const qrCodeSuccessCallback = (decodedText: string) => {
        if (decodedText) {
          setScanResult(decodedText);
          // Stop scanner after successful scan
          if (scannerRef.current && cameraStarted) {
            scannerRef.current.stop()
              .then(() => setCameraStarted(false))
              .catch(err => console.error("Failed to stop camera:", err));
          }
        }
      };
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };
      
      await scannerRef.current.start(
        { facingMode },
        config,
        qrCodeSuccessCallback,
        undefined
      );
      
      setCameraStarted(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err.message || "Failed to access camera. Please check camera permissions.");
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };
  
  // Helper functions to determine data type
  const isBatteryData = (data: any): data is BatteryData => {
    return 'batt_volt' in data;
  };

  const isPowerMeterData = (data: any): data is PowerMeterData => {
    return 'v1n' in data && 'avg_vll' in data;
  };

  // Function to fetch device data for preview
  const fetchDeviceData = async (packageId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Determine API endpoint based on scan mode
      let endpoint = '';
      if (scanMode === 'battery') {
        endpoint = `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail?package_name=${packageId.trim()}`;
      } else if (scanMode === 'genset') {
        endpoint = `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail_genset?package_name=${packageId.trim()}`;
      } else if (scanMode === 'power_meter') {
        endpoint = `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail_power_meter?package_name=${packageId.trim()}`;
      }
      
      const response = await axios.get(
        endpoint,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setPreviewData(response.data[0]);
        setStep('preview');
      } else {
        // If no data is returned, create a minimal preview with just the package name
        // This allows binding of new devices that don't have data yet
        createMinimalPreviewData(packageId);
        setStep('preview');
      }
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || `Failed to fetch ${scanMode} data. Please try again.`);
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const createMinimalPreviewData = (packageId: string) => {
    if (scanMode === 'battery') {
      setPreviewData({
        package_name: packageId.trim(),
        id_user: "",
        status_binding: "0",
        serial_number: "",
        manufacturer: "",
        brand: "",
        rated_voltage: "",
        rated_capacity: "",
        rated_energy: "",
        discharge_working_hours: "",
        charge_working_hours: "",
        idle_working_hours: "",
        cycle_charge: "",
        total_discharge_ah: "",
        batt_wh_charge: "",
        batt_wh_discharge: "",
        charging_cycle: "",
        total_charge_ah: "",
        batt_volt: "",
        batt_cur: "",
        soc: "",
        max_cell_volt: "",
        max_cv_no: "",
        min_cell_volt: "",
        min_cv_no: "",
        max_cell_temp: "",
        batt_wh: "",
        batt_ah: "",
        working_hour_telemetri: "",
        charging_hour_telemetri: "",
        software_version: "",
        updated_at: new Date().toISOString()
      } as BatteryData);
    } else if (scanMode === 'genset') {
      setPreviewData({
        package_name: packageId.trim(),
        status_pln: "0",
        v_pln_r: 0,
        v_pln_s: 0,
        v_pln_t: 0,
        v_genset_r: 0,
        v_genset_s: 0,
        v_genset_t: 0,
        a_pln_r: 0,
        a_pln_s: 0,
        a_pln_t: 0,
        a_genset_r: 0,
        a_genset_s: 0,
        a_genset_t: 0,
        kw_pln_r: 0,
        kw_pln_s: 0,
        kw_pln_t: 0,
        kw_genset_r: 0,
        kw_genset_s: 0,
        kw_genset_t: 0,
        kwh_pln_r: 0,
        kwh_pln_s: 0,
        kwh_pln_t: 0,
        kwh_genset_r: 0,
        kwh_genset_s: 0,
        kwh_genset_t: 0,
        fq_pln_r: 0,
        fq_pln_s: 0,
        fq_pln_t: 0,
        fq_genset_r: 0,
        fq_genset_s: 0,
        fq_genset_t: 0,
        pf_pln_r: 0,
        pf_pln_s: 0,
        pf_pln_t: 0,
        pf_genset_r: 0,
        pf_genset_s: 0,
        pf_genset_t: 0,
        status_binding: "0", // For binding compatibility
        id_user: "",         // For binding compatibility
        updated_at: new Date().toISOString()
      } as GensetData);
    } else if (scanMode === 'power_meter') {
      setPreviewData({
        package_name: packageId.trim(),
        updated_at: new Date().toISOString(),
        v1n: 0,
        v2n: 0,
        v3n: 0,
        avg_vln: 0,
        v12: 0,
        v23: 0,
        v31: 0,
        avg_vll: 0,
        cur1: 0,
        cur2: 0,
        cur3: 0,
        avg_cur: 0,
        kw1: 0,
        kw2: 0,
        kw3: 0,
        kva1: 0,
        kva2: 0,
        kva3: 0,
        total_kw: 0,
        total_kva: 0,
        avg_pf: 0,
        freq: 0,
        kwh: 0,
        kvah: 0,
        status_binding: "0", // For binding compatibility
        id_user: "",         // For binding compatibility
      } as PowerMeterData);
    }
  };

  const bindDevice = async () => {
    if (!previewData || !previewData.package_name) {
      setError("Package ID is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    setStep('binding');
    
    try {
      // Get user ID from session storage
      const userId = sessionStorage.getItem('id_user');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      // Get token from session storage
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Parse userId to match bigint in database
      const numericUserId = parseInt(userId);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID. Please log in again.');
      }
      
      // Use URLSearchParams to match exact form format expected by your API
      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('package_name', previewData.package_name.trim());
      urlEncodedData.append('id_user', numericUserId.toString());
      urlEncodedData.append('status_binding', '1'); // smallint in DB
      
      console.log('Sending form data:', Object.fromEntries(urlEncodedData));
      
      // Determine API endpoint based on scan mode - using same endpoint for all types
      const endpoint = 'https://portal4.incoe.astra.co.id:4433/api/add_binding_battery';
      
      // Send data in x-www-form-urlencoded format (matching r.ParseForm() in Go)
      const response = await axios.post(
        endpoint,
        urlEncodedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        }
      );
      
      if (response.data.status === 'success') {
        // Call success callback to refresh the device list
        onSuccess();
        // Close the modal
        onClose();
      } else {
        throw new Error(response.data.message || `Failed to bind ${scanMode}`);
      }
    } catch (err: any) {
      console.error('Binding error:', err);
      setError(err.message || `Failed to bind ${scanMode}. Please try again.`);
      setStep('preview'); // Go back to preview on error
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (packageId: string) => {
    if (!packageId.trim()) return;
    fetchDeviceData(packageId);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanResult(manualInput);
  };

  const resetScan = () => {
    setScanResult(null);
    setPreviewData(null);
    setStep('scan');
    initializeScanner();
  };

  const resetToScan = () => {
    setPreviewData(null);
    setStep('scan');
  };

  // This function specifically handles dialog closing to prevent unintended closures
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  // Handle mode change
  const handleModeChange = (newMode: ScanMode) => {
    setScanMode(newMode);
    setScanResult(null);
    setManualInput('');
    setError(null);
    setPreviewData(null);
    // Don't restart scanner as it's already running
  };

  // Get device type display name
  const getDeviceTypeName = () => {
    switch(scanMode) {
      case 'battery': return 'Battery';
      case 'genset': return 'Genset';
      case 'power_meter': return 'Power Meter';
      default: return 'Device';
    }
  };

  // Render preview component based on device type
  const renderPreviewComponent = () => {
    if (!previewData) return null;

    if (isBatteryData(previewData)) {
      return (
        <BatteryPreview 
          data={previewData} 
          loading={loading} 
          onBack={resetToScan} 
          onBind={bindDevice} 
        />
      );
    } else if (isPowerMeterData(previewData)) {
      return (
        <PowerMeterPreview 
          data={previewData} 
          loading={loading} 
          onBack={resetToScan} 
          onBind={bindDevice} 
        />
      );
    } else {
      return (
        <GensetPreview 
          data={previewData as GensetData} 
          loading={loading} 
          onBack={resetToScan} 
          onBind={bindDevice} 
        />
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md p-0" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {step === 'scan' && `Scan ${getDeviceTypeName()} QR Code`}
            {step === 'preview' && `Verify ${getDeviceTypeName()} Data`}
            {step === 'binding' && `Binding ${getDeviceTypeName()}...`}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 pt-2">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              {/* Scan Step */}
              {step === 'scan' && (
                <ScanStep 
                  scanMode={scanMode}
                  onModeChange={handleModeChange}
                  scanResult={scanResult}
                  cameraStarted={cameraStarted}
                  error={error}
                  loading={loading}
                  scannerContainerId={scannerContainerId}
                  onToggleCamera={toggleCamera}
                  onInitScanner={initializeScanner}
                  onResetScan={resetScan}
                  onScanResult={handleScanResult}
                  manualInput={manualInput}
                  onManualInputChange={setManualInput}
                  onSubmitManual={handleSubmitManual}
                  facingMode={facingMode}
                  deviceTypeName={getDeviceTypeName()}
                />
              )}
              
              {/* Preview Step */}
              {step === 'preview' && renderPreviewComponent()}
              
              {/* Binding Step - Loading indicator */}
              {step === 'binding' && (
                <BindingStep 
                  deviceTypeName={getDeviceTypeName()} 
                  packageName={previewData?.package_name || ''} 
                />
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between sm:justify-between p-6 pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {step === 'scan' && (
            <p className="text-xs text-gray-500">
              Scan the QR code on the {getDeviceTypeName().toLowerCase()} package
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;