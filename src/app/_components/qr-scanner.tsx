// _components/qr-scanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


// Define the battery data structure based on the API response
interface BatteryData {
  package_name: string;
  id_user: string;
  status_binding: string;
  serial_number: string;
  manufacturer: string;
  brand: string;
  rated_voltage: string;
  rated_capacity: string;
  rated_energy: string;
  discharge_working_hours: string;
  charge_working_hours: string;
  idle_working_hours: string;
  cycle_charge: string;
  total_discharge_ah: string;
  batt_wh_charge: string;
  batt_wh_discharge: string;
  charging_cycle: string;
  total_charge_ah: string;
  batt_volt: string;
  batt_cur: string;
  soc: string;
  max_cell_volt: string;
  max_cv_no: string;
  min_cell_volt: string;
  min_cv_no: string;
  max_cell_temp: string;
  batt_wh: string;
  batt_ah: string;
  working_hour_telemetri: string;
  charging_hour_telemetri: string;
  software_version: string;
  updated_at: string;
}

// Define the API response type
type ApiResponse = BatteryData[];

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onSuccess }) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [previewData, setPreviewData] = useState<BatteryData | null>(null);
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
  
  // Function to fetch battery data for preview
  const fetchBatteryData = async (packageId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(
        `https://portal4.incoe.astra.co.id:4433/api/data_binding_detail?package_name=${packageId.trim()}`,
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
        // If no data is returned, we'll create a minimal preview with just the package name
        // This allows binding of new batteries that don't have data yet
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
        });
        setStep('preview');
      }
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Failed to fetch battery data. Please try again.');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const bindBattery = async () => {
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
      
      // Send data in x-www-form-urlencoded format (matching r.ParseForm() in Go)
      const response = await axios.post(
        'https://portal4.incoe.astra.co.id:4433/api/add_binding_battery',
        urlEncodedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        }
      );
      
      if (response.data.status === 'success') {
        // Call success callback to refresh the battery list
        onSuccess();
        // Close the modal
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to bind battery');
      }
    } catch (err: any) {
      console.error('Binding error:', err);
      setError(err.message || 'Failed to bind battery. Please try again.');
      setStep('preview'); // Go back to preview on error
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (packageId: string) => {
    if (!packageId.trim()) return;
    fetchBatteryData(packageId);
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

  // Convert minutes to hours with 2 decimal places
  const minutesToHours = (minutes: string): string => {
    const mins = parseFloat(minutes);
    if (isNaN(mins)) return '0.00';
    return (mins / 60).toFixed(2);
  };

  // Format date to local time
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  // This function specifically handles dialog closing to prevent unintended closures
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {step === 'scan' && 'Scan Battery QR Code'}
            {step === 'preview' && 'Verify Battery Data'}
            {step === 'binding' && 'Binding Battery...'}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-2 space-y-4">
          {/* Scan Step */}
          {step === 'scan' && (
            <div className="space-y-6">
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
                          onClick={toggleCamera}
                          className="flex items-center space-x-1"
                          disabled={!cameraStarted}
                        >
                          <span>Switch Camera</span>
                          <span>{facingMode === 'environment' ? '📷' : '🤳'}</span>
                        </Button>
                        
                        {error && (
                          <Button 
                            onClick={initializeScanner}
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
                        <Button variant="outline" onClick={resetScan} disabled={loading}>
                          Scan Again
                        </Button>
                        <Button 
                          onClick={() => handleScanResult(scanResult)} 
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {loading ? 'Checking...' : 'Check Battery Data'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Input Section */}
              <div className="space-y-2 pt-2 border-t">
                <h3 className="font-medium text-sm">Manual Input</h3>
                <form onSubmit={handleSubmitManual} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="packageId">Package ID</Label>
                    <Input 
                      id="packageId"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Enter package ID manually"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Enter the battery package ID exactly as it appears on the package
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                    disabled={loading || !manualInput.trim()}
                  >
                    {loading ? 'Checking...' : 'Check Battery Data'}
                  </Button>
                </form>
              </div>
            </div>
          )}
          
          {/* Preview Step */}
          {step === 'preview' && previewData && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-700 mb-2">Battery Details</h3>
                
                <div className="space-y-4">
                  {/* Basic info */}
                  <div className="bg-white rounded-lg p-4 border border-blue-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-3xl">🔋</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{previewData.package_name}</h4>
                    <p className="text-sm text-gray-500">{previewData.brand || previewData.manufacturer || "Unknown Brand"}</p>
                    
                    {previewData.status_binding === "1" && (
                      <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Already bound to a user
                      </div>
                    )}
                  </div>
                  
                  {/* Battery specs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                      <p className="font-medium">{previewData.serial_number || "N/A"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Software Version</p>
                      <p className="font-medium">{previewData.software_version || "N/A"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Rated Voltage</p>
                      <p className="font-medium">{previewData.rated_voltage || "N/A"} V</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Rated Capacity</p>
                      <p className="font-medium">{previewData.rated_capacity || "N/A"} Ah</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Current Voltage</p>
                      <p className="font-medium">{parseFloat(previewData.batt_volt || "0").toFixed(2)} V</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">State of Charge</p>
                      <p className="font-medium">{previewData.soc || "0"}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Working Hours</p>
                      <p className="font-medium">{minutesToHours(previewData.working_hour_telemetri || "0")} h</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Last Update</p>
                      <p className="font-medium text-xs">{formatDate(previewData.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confirmation buttons */}
              <div className="flex justify-between pt-2 border-t">
                <Button variant="outline" onClick={resetToScan} disabled={loading}>
                  Go Back
                </Button>
                <Button 
                  onClick={bindBattery} 
                  disabled={loading || previewData.status_binding === "1"}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {loading ? 'Binding...' : 'Confirm & Bind Battery'}
                </Button>
              </div>
              
              {previewData.status_binding === "1" && (
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertDescription>
                    This battery appears to be already bound to a user. You cannot bind it again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Binding Step - Loading indicator */}
          {step === 'binding' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-blue-500 font-medium">Binding Battery...</p>
              <p className="text-sm text-gray-500 text-center">
                Please wait while we bind package {previewData?.package_name} to your account
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {step === 'scan' && (
            <p className="text-xs text-gray-500">
              Scan the QR code on the battery package
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;