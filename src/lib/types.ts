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