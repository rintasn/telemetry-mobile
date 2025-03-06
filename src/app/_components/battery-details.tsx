// components/battery-details.tsx
import { Button } from "@/components/ui/button";
import { Battery } from "@/lib/types";

interface BatteryDetailsProps {
  battery: Battery;
  onBack: () => void;
}

export default function BatteryDetails({
  battery,
  onBack,
}: BatteryDetailsProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button onClick={onBack} variant="ghost" className="text-blue-500">
          &lt;
        </Button>
        <h2 className="text-xl font-bold text-center">Details</h2>
      </div>

      <div className="text-center mb-4">
        <p className="text-gray-600">Data updated on: {battery.updatedAt}</p>
        <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-6 mt-2">
          Discharge
        </Button>
      </div>

      <div className="flex border-b border-gray-200 mb-4">
        <Button
          variant="ghost"
          className="flex-1 text-blue-500 border-b-2 border-blue-500"
        >
          RT Status
        </Button>
        <Button variant="ghost" className="flex-1 text-gray-500">
          Statistics
        </Button>
        <Button variant="ghost" className="flex-1 text-gray-500">
          Alarms
        </Button>
        <Button variant="ghost" className="flex-1 text-gray-500">
          Upgrades
        </Button>
      </div>

      {/* SOC Circle */}
      <div className="mt-8 pb-8">
        <div className="flex justify-center items-center mb-8">
          <div className="w-48 h-48 rounded-full bg-blue-100 flex justify-center items-center relative">
            <div className="w-40 h-40 rounded-full border-8 border-white flex justify-center items-center">
              <div className="text-center">
                <div className="text-4xl font-medium text-white">
                  {battery.details.soc}%
                </div>
                <div className="text-white">SOC</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between px-12 mb-8">
          <div className="text-center">
            <div className="text-2xl font-medium">
              {battery.details.voltage}
            </div>
            <div className="text-gray-500">Voltage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium">
              {battery.details.current}
            </div>
            <div className="text-gray-500">Current</div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4">System Infomation</h3>
          <div className="space-y-px">
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">Real-time Alarm</span>
              <span className="text-orange-500">Insulation</span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">SOC</span>
              <span className="text-gray-500">{battery.details.soc}%</span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">SOH</span>
              <span className="text-gray-500">{battery.details.soh}%</span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">Average Voltage</span>
              <span className="text-gray-500">
                {battery.details.avgVoltage}
              </span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">Average Temperature</span>
              <span className="text-gray-500">{battery.details.avgTemp}</span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">
                Positive Insulation Resistance
              </span>
              <span className="text-gray-500">
                {battery.details.positiveInsulationResistance}
              </span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100">
              <span className="text-gray-700">
                Negative Insulation Resistance
              </span>
              <span className="text-gray-500">
                {battery.details.negativeInsulationResistance}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* System Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-gray-200 pb-4">
          <div className="flex justify-between py-4">
            <span className="text-gray-800 font-medium">
              Negative Insulation Resistance
            </span>
            <span className="text-gray-400">
              {battery.details.negativeInsulationResistance}
            </span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-gray-800 font-medium">
              Number Of Online Battery Strings
            </span>
            <span className="text-gray-400">
              {battery.details.onlineBatteryStrings}
            </span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-gray-800 font-medium">
              Online Cell Temperature Sensor
            </span>
            <span className="text-gray-400">
              {battery.details.onlineTempSensors}
            </span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-gray-800 font-medium">Signal Strength</span>
            <span className="text-gray-400">
              {battery.details.signalStrength}
            </span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-gray-800 font-medium">Current Location</span>
            <span className="text-gray-400 flex items-center">
              {battery.details.location} &gt;
            </span>
          </div>
        </div>

        {/* Cell Voltage */}
        <div>
          <h3 className="text-lg font-medium text-center mb-4">Cell Voltage</h3>
          <div className="h-64 mb-4">
            <div className="h-full w-full flex items-end">
              {battery.details.cellVoltages.map((voltage, index) => (
                <div key={`cell-${index}`} className="flex-1 mx-0.5 relative">
                  <div className="h-56 bg-blue-200 relative">
                    {index + 1 === 9 && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          {battery.details.maxVoltage}
                        </div>
                        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-blue-500 absolute -bottom-2 left-1/2 transform rotate-180 -translate-x-1/2"></div>
                      </div>
                    )}
                    {index + 1 === 15 && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          {battery.details.minVoltage}
                        </div>
                        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-blue-500 absolute -bottom-2 left-1/2 transform rotate-180 -translate-x-1/2"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-xs mt-1">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Max Voltage</div>
              <div className="text-blue-500 font-medium">
                {battery.details.maxVoltage}
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Monomer Position</div>
              <div className="text-blue-500 font-medium">9#</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Min Voltage</div>
              <div className="text-blue-500 font-medium">
                {battery.details.minVoltage}
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Monomer Position</div>
              <div className="text-blue-500 font-medium">15#</div>
            </div>
          </div>

          {/* Cell Temperature */}
          <h3 className="text-lg font-medium text-center mb-4">
            Cell Temperature
          </h3>
          <div className="h-48 mb-4 px-4">
            <div className="relative h-full w-full">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>

              <div className="flex justify-between items-end h-full relative">
                {battery.details.tempPoints.map((point, index) => (
                  <div
                    key={`temp-${index}`}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="absolute"
                      style={{
                        bottom: `${(point / 50) * 100}%`,
                        left: `${
                          (index / (battery.details.tempPoints.length - 1)) *
                          100
                        }%`,
                        transform: "translate(-50%, 50%)",
                      }}
                    >
                      {index === 0 && (
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs mb-1">
                          40
                        </div>
                      )}
                      {index === 3 && (
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs mb-1">
                          43
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs">#{index + 1}</div>
                  </div>
                ))}
                <svg className="absolute bottom-0 left-0 right-0 h-3/4 w-full overflow-visible">
                  <polyline
                    points="0,80 100,70 200,75 300,60"
                    style={{
                      fill: "none",
                      stroke: "blue",
                      strokeWidth: "2",
                      vectorEffect: "non-scaling-stroke",
                    }}
                  />
                  <circle cx="0" cy="80" r="4" fill="blue" />
                  <circle cx="100" cy="70" r="4" fill="blue" />
                  <circle cx="200" cy="75" r="4" fill="blue" />
                  <circle cx="300" cy="60" r="4" fill="blue" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Max Temperature</div>
              <div className="text-blue-500 font-medium">
                {battery.details.maxTemp}
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Probe Position</div>
              <div className="text-gray-500">4#</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Min Temperature</div>
              <div className="text-blue-500 font-medium">
                {battery.details.minTemp}
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-gray-500">Probe Position</div>
              <div className="text-gray-500">1#</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
