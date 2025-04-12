// hooks/useBatterySummary.ts
import { useMemo } from "react";
import { BatteryData, BatterySummaryData } from "@/lib/types";

export function useBatterySummary(data: BatteryData[] | undefined): BatterySummaryData | null {
  return useMemo(() => {
    if (!data || data.length === 0) return null;

    // 1. Status Baterai
    const totalBatteries = data.length;
    const activeBatteries = data.filter(b => b.status_binding === "1").length;
    const activeBatteriesPercentage = (activeBatteries / totalBatteries) * 100;

    // 2. SOC Categories (untuk baterai yang aktif)
    const activeBatteriesWithSoc = data.filter(b => b.status_binding === "1");
    // Baterai aktif dengan nilai SOC yang valid (bukan 0)
    const validSocBatteries = activeBatteriesWithSoc.filter(b => parseFloat(b.soc) > 0);
    const validSocCount = validSocBatteries.length;
    
    const socCategories = {
      critical: 0,  // 0-20%
      low: 0,       // 21-40%
      medium: 0,    // 41-60%
      high: 0,      // 61-80%
      full: 0,      // 81-100%
      unknown: 0    // Tidak ada data (termasuk nilai 0)
    };

    activeBatteriesWithSoc.forEach(battery => {
      const socValue = parseFloat(battery.soc);
      if (isNaN(socValue) || socValue <= 0) {
        socCategories.unknown++;
      } else if (socValue <= 20) {
        socCategories.critical++;
      } else if (socValue <= 40) {
        socCategories.low++;
      } else if (socValue <= 60) {
        socCategories.medium++;
      } else if (socValue <= 80) {
        socCategories.high++;
      } else {
        socCategories.full++;
      }
    });

    // 3. SOH Categories (untuk baterai yang aktif)
    // Baterai aktif dengan nilai SOH yang valid (bukan 0)
    const validSohBatteries = activeBatteriesWithSoc.filter(b => parseFloat(b.soh) > 0);
    const validSohCount = validSohBatteries.length;
    
    const sohCategories = {
      critical: 0,  // 0-40%
      poor: 0,      // 41-70%
      fair: 0,      // 71-85%
      good: 0,      // 86-95%
      excellent: 0, // 96-100%
      unknown: 0    // Tidak ada data (termasuk nilai 0)
    };

    activeBatteriesWithSoc.forEach(battery => {
      const sohValue = parseFloat(battery.soh);
      if (isNaN(sohValue) || sohValue <= 0) {
        sohCategories.unknown++;
      } else if (sohValue <= 40) {
        sohCategories.critical++;
      } else if (sohValue <= 70) {
        sohCategories.poor++;
      } else if (sohValue <= 85) {
        sohCategories.fair++;
      } else if (sohValue <= 95) {
        sohCategories.good++;
      } else {
        sohCategories.excellent++;
      }
    });

    // 4. Signal Categories (untuk semua baterai)
    const signalCategories = {
      poor: 0,       // 0-7
      fair: 0,       // 8-15
      good: 0,       // 16-23
      excellent: 0   // 24-31
    };
    
    data.forEach(battery => {
      const signalValue = battery.signal;
      if (signalValue === undefined || signalValue === null) {
        // No signal data
      } else if (signalValue <= 7) {
        signalCategories.poor++;
      } else if (signalValue <= 15) {
        signalCategories.fair++;
      } else if (signalValue <= 23) {
        signalCategories.good++;
      } else {
        signalCategories.excellent++;
      }
    });

    // Untuk nilai rata-rata (masih berguna untuk beberapa kasus)
    const avgSoc = validSocBatteries.length 
      ? validSocBatteries.reduce((acc, curr) => acc + parseFloat(curr.soc), 0) / validSocBatteries.length 
      : 0;

    const avgSoh = validSohBatteries.length 
      ? validSohBatteries.reduce((acc, curr) => acc + parseFloat(curr.soh), 0) / validSohBatteries.length 
      : 0;

    // 5. Total charging cycle
    const totalChargingCycle = data.reduce((acc, curr) => acc + parseFloat(curr.charging_cycle || "0"), 0);
    const avgChargingCycle = totalChargingCycle / totalBatteries;

    // 6. Energi
    const totalChargeWh = data.reduce((acc, curr) => acc + parseFloat(curr.batt_wh_charge || "0"), 0);
    const totalDischargeWh = data.reduce((acc, curr) => acc + parseFloat(curr.batt_wh_discharge || "0"), 0);
    const energyEfficiency = totalDischargeWh !== 0 
      ? Math.abs((totalChargeWh / Math.abs(totalDischargeWh)) * 100) 
      : 0;

    // 7. Utilitas
    const totalWorkingHours = data.reduce((acc, curr) => {
      const discharge = parseFloat(curr.discharge_working_hours || "0");
      const charge = parseFloat(curr.charge_working_hours || "0");
      const idle = parseFloat(curr.idle_working_hours || "0");
      return acc + discharge + charge + idle;
    }, 0);

    const totalActiveHours = data.reduce((acc, curr) => {
      const discharge = parseFloat(curr.discharge_working_hours || "0");
      const charge = parseFloat(curr.charge_working_hours || "0");
      return acc + discharge + charge;
    }, 0);

    const activeTimePercentage = (totalActiveHours / totalWorkingHours) * 100;

    // 8. Suhu maksimum
    const maxTemp = Math.max(...data.map(b => parseFloat(b.max_cell_temp || "0")));

    // 9. Distribusi Brand
    const brandDistribution = data.reduce((acc: Record<string, number>, curr) => {
      const brand = curr.brand || "Not Active";
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    // 10. Kapasitas rata-rata
    const avgCapacity = data.reduce((acc, curr) => acc + parseFloat(curr.rated_capacity || "0"), 0) / totalBatteries;

    // 11. Software versions distribution
    const softwareVersions = data.reduce((acc: Record<string, number>, curr) => {
      const version = curr.software_version || "Not Active";
      acc[version] = (acc[version] || 0) + 1;
      return acc;
    }, {});
    
    // 12. Estimated Battery Lifetime (berdasarkan SOH dan charging cycle)
    const estimatedLifetime = activeBatteriesWithSoc
      .filter(b => parseFloat(b.soh) > 0 && parseFloat(b.charging_cycle) > 0)
      .map(b => {
        const soh = parseFloat(b.soh);
        const chargingCycle = parseFloat(b.charging_cycle);
        // Asumsi: degradasi linier dan EOL pada SOH = 70%
        if (soh > 70 && chargingCycle > 0) {
          const remainingHealth = soh - 70; // Presentase SOH yang tersisa hingga EOL
          const degrationRate = (100 - soh) / chargingCycle; // Pengurangan SOH per siklus
          return degrationRate > 0 ? remainingHealth / degrationRate : 0; // Siklus tersisa
        }
        return 0;
      });
    
    const avgEstimatedCycles = estimatedLifetime.length > 0 
      ? estimatedLifetime.reduce((acc, curr) => acc + curr, 0) / estimatedLifetime.length
      : 0;

    return {
      totalBatteries,
      activeBatteries,
      activeBatteriesPercentage,
      validSocCount,
      validSohCount,
      socCategories,
      sohCategories,
      signalCategories,
      avgSoc,
      avgSoh,
      avgChargingCycle,
      energyEfficiency,
      totalWorkingHours,
      activeTimePercentage,
      maxTemp,
      brandDistribution,
      avgCapacity,
      softwareVersions,
      avgEstimatedCycles,
    };
  }, [data]);
}