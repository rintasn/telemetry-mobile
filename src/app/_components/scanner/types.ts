// _components/scanner/types.ts

export interface QRScannerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }
  
  // Define the scan mode type
  export type ScanMode = 'battery' | 'genset' | 'power_meter';
  
  // Define the battery data structure based on the API response
  export interface BatteryData {
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
  
  // Define the genset data structure based on the API response
  export interface GensetData {
    package_name: string;
    status_pln: string;
    v_pln_r: number;
    v_pln_s: number;
    v_pln_t: number;
    v_genset_r: number;
    v_genset_s: number;
    v_genset_t: number;
    a_pln_r: number;
    a_pln_s: number;
    a_pln_t: number;
    a_genset_r: number;
    a_genset_s: number;
    a_genset_t: number;
    kw_pln_r: number;
    kw_pln_s: number;
    kw_pln_t: number;
    kw_genset_r: number;
    kw_genset_s: number;
    kw_genset_t: number;
    kwh_pln_r: number;
    kwh_pln_s: number;
    kwh_pln_t: number;
    kwh_genset_r: number;
    kwh_genset_s: number;
    kwh_genset_t: number;
    fq_pln_r: number;
    fq_pln_s: number;
    fq_pln_t: number;
    fq_genset_r: number;
    fq_genset_s: number;
    fq_genset_t: number;
    pf_pln_r: number;
    pf_pln_s: number;
    pf_pln_t: number;
    pf_genset_r: number;
    pf_genset_s: number;
    pf_genset_t: number;
    updated_at: string;
    status_binding?: string; // Added for compatibility with binding logic
    id_user?: string; // Added for compatibility with binding logic
  }
  
  // Define the power meter data structure based on the API response
  export interface PowerMeterData {
    package_name: string;
    updated_at: string;
    v1n: number;
    v2n: number;
    v3n: number;
    avg_vln: number;
    v12: number;
    v23: number;
    v31: number;
    avg_vll: number;
    cur1: number;
    cur2: number;
    cur3: number;
    avg_cur: number;
    kw1: number;
    kw2: number;
    kw3: number;
    kva1: number;
    kva2: number;
    kva3: number;
    total_kw: number;
    total_kva: number;
    avg_pf: number;
    freq: number;
    kwh: number;
    kvah: number;
    status_binding?: string; // Added for compatibility with binding logic
    id_user?: string; // Added for compatibility with binding logic
  }
  
  // Union type for the device data
  export type DeviceData = BatteryData | GensetData | PowerMeterData;
  
  // Props for the device preview components
  export interface DevicePreviewProps {
    data: DeviceData;
    loading: boolean;
    onBack: () => void;
    onBind: () => void;
  }
  
  // Specific props for each device type
  export interface BatteryPreviewProps {
    data: BatteryData;
    loading: boolean;
    onBack: () => void;
    onBind: () => void;
  }
  
  export interface GensetPreviewProps {
    data: GensetData;
    loading: boolean;
    onBack: () => void;
    onBind: () => void;
  }
  
  export interface PowerMeterPreviewProps {
    data: PowerMeterData;
    loading: boolean;
    onBack: () => void;
    onBind: () => void;
  }
  
  // Props for the scan step component
  export interface ScanStepProps {
    scanMode: ScanMode;
    onModeChange: (mode: ScanMode) => void;
    scanResult: string | null;
    cameraStarted: boolean;
    error: string | null;
    loading: boolean;
    scannerContainerId: string;
    onToggleCamera: () => void;
    onInitScanner: () => void;
    onResetScan: () => void;
    onScanResult: (result: string) => void;
    manualInput: string;
    onManualInputChange: (value: string) => void;
    onSubmitManual: (e: React.FormEvent) => void;
    facingMode: 'environment' | 'user';
    deviceTypeName: string;
  }
  
  // Props for the binding step component
  export interface BindingStepProps {
    deviceTypeName: string;
    packageName: string;
  }
  
  // Helper functions for formatting
  export const formatUtils = {
    // Convert minutes to hours with 2 decimal places
    minutesToHours: (minutes: string): string => {
      const mins = parseFloat(minutes);
      if (isNaN(mins)) return '0.00';
      return (mins / 60).toFixed(2);
    },
  
    // Format number with 2 decimal places
    formatNumber: (value: number | string, defaultValue = '0.00'): string => {
      if (value === undefined || value === null || value === '') return defaultValue;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return defaultValue;
      return num.toFixed(2);
    },
  
    // Format date to local time
    formatDate: (dateString: string): string => {
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
    }
  };