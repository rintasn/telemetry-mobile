// app/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BatteryList from "../_components/battery-list";
import BatteryDetails from "../_components/battery-details";
import { batteryData } from "@/lib/data";
import { Battery } from "@/lib/types";

export default function Home() {
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);

  return (
    <main className="min-h-screen bg-blue-50">
      <div className="bg-blue-500 p-4 flex items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">👤</span>
          </div>
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">INCOE LITHIUM</h1>
          <p className="text-white text-sm">Personal Homepage &gt;</p>
        </div>
        <div className="ml-auto flex gap-4">
          <div className="w-8 h-8 bg-transparent border-2 border-white rounded flex items-center justify-center">
            <span className="text-white">⤢</span>
          </div>
          <div className="w-8 h-8 bg-transparent border-2 border-white rounded flex items-center justify-center">
            <span className="text-white">≡</span>
          </div>
        </div>
      </div>

      {!selectedBattery ? (
        <div className="container mx-auto p-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-gray-700">
                Bound device
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BatteryList 
                batteries={batteryData} 
                onBatterySelect={setSelectedBattery}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <BatteryDetails 
          battery={selectedBattery} 
          onBack={() => setSelectedBattery(null)} 
        />
      )}
    </main>
  );
}