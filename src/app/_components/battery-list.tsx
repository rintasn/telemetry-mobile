// components/battery-list.tsx
import { Battery } from "@/lib/types";

// Create a Button component since we're missing it
const Button = ({ 
  children, 
  className = "", 
  onClick = () => {} 
}: { 
  children: React.ReactNode, 
  className?: string, 
  onClick?: () => void 
}) => {
  return (
    <button 
      className={`px-4 py-2 rounded font-medium ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface BatteryListProps {
  batteries: Battery[];
  onBatterySelect: (battery: Battery) => void;
}

export default function BatteryList({ batteries, onBatterySelect }: BatteryListProps) {
  return (
    <div className="space-y-6">
      {batteries.map((battery) => (
        <div key={battery.serialNumber} className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-blue-600 font-medium">
              Batt. SN: {battery.serialNumber}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
                onClick={() => onBatterySelect(battery)}
              >
                Discharge
              </Button>
              <div className="flex items-center">
                <div className="w-16 h-6 bg-green-100 border border-green-400 rounded flex items-center">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${battery.chargeLevel}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-gray-700">{battery.chargeLevel}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Activation:</span>
              <span className="text-gray-600">{battery.activationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Cycles:</span>
              <span className="text-gray-600">{battery.cycles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Chg Time:</span>
              <span className="text-gray-600">{battery.chargeTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Run Time:</span>
              <span className="text-gray-600">{battery.runTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Updated:</span>
              <span className="text-gray-600">{battery.updatedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Online Rate:</span>
              <span className="text-gray-600">{battery.onlineRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">SIM Exp Date:</span>
              <span className="text-gray-600">{battery.simExpDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Service:</span>
              <span className="text-gray-600">{battery.service}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}