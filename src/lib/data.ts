// lib/data.ts
import { Battery } from "./types";

export const batteryData: Battery[] = [
  {
    id: 1,
    serialNumber: "F3142-19-99338",
    activationDate: "2023-01-07",
    cycles: 903,
    chargeTime: "4040.6h",
    runTime: "7463.2h",
    updatedAt: "2025-03-06 12:28:52",
    onlineRate: "0%",
    simExpDate: "2025-01-31",
    service: "Normal",
    chargeLevel: 62.2,
    details: {
      negativeInsulationResistance: "17KΩ",
      onlineBatteryStrings: 16,
      onlineTempSensors: 4,
      signalStrength: 23,
      location: "Karawang",
      cellVoltages: Array(16).fill(3.3),
      maxVoltage: "3.328 V",
      minVoltage: "3.321 V",
      tempPoints: [40, 42, 40, 43],
      maxTemp: "43°C",
      minTemp: "40°C",
      soc: 61.9,
      voltage: "53.2 V",
      current: "-101.8 A",
      soh: "97.5%",
      avgVoltage: "3.32 V",
      avgTemp: "41.25°C",
      positiveInsulationResistance: "65536KΩ"
    }
  },
  {
    id: 2,
    serialNumber: "F3142-20-99338",
    activationDate: "2023-01-07",
    cycles: 682,
    chargeTime: "3542.0h",
    runTime: "7990.4h",
    updatedAt: "2025-03-06 12:28:26",
    onlineRate: "0%",
    simExpDate: "2025-01-31",
    service: "Normal",
    chargeLevel: 73.2,
    details: {
      negativeInsulationResistance: "17KΩ",
      onlineBatteryStrings: 16,
      onlineTempSensors: 4,
      signalStrength: 23,
      location: "Karawang",
      cellVoltages: Array(16).fill(3.3),
      maxVoltage: "3.328 V",
      minVoltage: "3.321 V",
      tempPoints: [40, 42, 40, 43],
      maxTemp: "43°C",
      minTemp: "40°C",
      soc: 61.9,
      voltage: "53.2 V",
      current: "-101.8 A",
      soh: "97.5%",
      avgVoltage: "3.32 V",
      avgTemp: "41.25°C",
      positiveInsulationResistance: "65536KΩ"
    }
  },
  {
    id: 3,
    serialNumber: "F3142-37-99338",
    activationDate: "2023-01-08",
    cycles: 173,
    chargeTime: "642.6h",
    runTime: "10082.4h",
    updatedAt: "2025-03-06 12:27:48",
    onlineRate: "0%",
    simExpDate: "2025-01-31",
    service: "Normal",
    chargeLevel: 60.2,
    details: {
      negativeInsulationResistance: "17KΩ",
      onlineBatteryStrings: 16,
      onlineTempSensors: 4,
      signalStrength: 23,
      location: "Karawang",
      cellVoltages: Array(16).fill(3.3),
      maxVoltage: "3.328 V",
      minVoltage: "3.321 V",
      tempPoints: [40, 42, 40, 43],
      maxTemp: "43°C",
      minTemp: "40°C",
      soc: 61.9,
      voltage: "53.2 V",
      current: "-101.8 A",
      soh: "97.5%",
      avgVoltage: "3.32 V",
      avgTemp: "41.25°C",
      positiveInsulationResistance: "65536KΩ"
    }
  }
];