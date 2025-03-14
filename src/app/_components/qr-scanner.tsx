// _components/qr-scanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onSuccess }) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  // Initialize scanner when dialog opens
  useEffect(() => {
    if (open) {
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
          startScanner();
        })
        .catch(err => {
          console.error("Failed to stop camera:", err);
          setError("Failed to switch camera. Please try again.");
        });
    }
  }, [facingMode]);

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

  const bindBattery = async () => {
    if (!scanResult) return;
    
    setLoading(true);
    setError(null);
    
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
      
      // Create form data
      const formData = new FormData();
      formData.append('package_name', scanResult);
      formData.append('id_user', userId);
      formData.append('status_binding', '1'); // Active binding
      
      // Send POST request
      const response = await axios.post(
        'https://portal4.incoe.astra.co.id:4433/api/add_binding_battery',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    initializeScanner();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code to Bind Battery</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center space-y-4">
          {!scanResult ? (
            <>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                {/* Scanner container */}
                <div 
                  id={scannerContainerId} 
                  style={{ width: '100%', minHeight: '300px', position: 'relative' }} 
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
              
              <p className="text-sm text-gray-500 text-center">
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
                <Button onClick={bindBattery} disabled={loading}>
                  {loading ? 'Binding...' : 'Bind Battery'}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {scanResult && (
            <p className="text-xs text-gray-500">
              Make sure the package ID is correct before binding
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;