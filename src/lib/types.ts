// lib/types.ts

export interface BatteryDetails {
    negativeInsulationResistance: string;
    onlineBatteryStrings: number;
    onlineTempSensors: number;
    signalStrength: number;
    location: string;
    cellVoltages: number[];
    maxVoltage: string;
    minVoltage: string;
    tempPoints: number[];
    maxTemp: string;
    minTemp: string;
    soc: number;
    voltage: string;
    current: string;
    soh: string;
    avgVoltage: string;
    avgTemp: string;
    positiveInsulationResistance: string;
  }
  
  export interface Battery {
    id: number;
    serialNumber: string;
    activationDate: string;
    cycles: number;
    chargeTime: string;
    runTime: string;
    updatedAt: string;
    onlineRate: string;
    simExpDate: string;
    service: string;
    chargeLevel: number;
    details: BatteryDetails;
  }

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
    soh: string;
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
    latitude: number;
    longitude: number;
    signal: number;
  }

  export interface SOCCategoriesType {
    critical: number;
    low: number;
    medium: number;
    high: number;
    full: number;
    unknown: number;
  }

  export interface SOHCategoriesType {
    critical: number;
    poor: number;
    fair: number;
    good: number;
    excellent: number;
    unknown: number;
  }

  export interface SignalCategoriesType {
    poor: number;    // 0-7
    fair: number;    // 8-15
    good: number;    // 16-23
    excellent: number; // 24-31
  }

  export interface BatterySummaryData {
    totalBatteries: number;
    activeBatteries: number;
    activeBatteriesPercentage: number;
    validSocCount: number;
    validSohCount: number;
    socCategories: SOCCategoriesType;
    sohCategories: SOHCategoriesType;
    signalCategories: SignalCategoriesType;
    avgSoc: number;
    avgSoh: number;
    avgChargingCycle: number;
    energyEfficiency: number;
    totalWorkingHours: number;
    activeTimePercentage: number;
    maxTemp: number;
    brandDistribution: Record<string, number>;
    avgCapacity: number;
    softwareVersions: Record<string, number>;
    avgEstimatedCycles: number;
  }