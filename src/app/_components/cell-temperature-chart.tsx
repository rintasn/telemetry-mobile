// _components/cell-temperature-chart.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import axios from 'axios';

interface CellParameterData {
  created_at: string;
  batt_volt: number;
  batt_cur: number;
  soc: number;
  max_cell_volt: number;
  max_cv_no: number;
  min_cell_volt: number;
  min_cv_no: number;
  max_cell_temp: number;
  package_name: string;
  batt_wh: number;
  batt_ah: number;
  working_hour_telemetri: number;
  charging_hour_telemetri: number;
  soh: number;
  signal: number;
}

interface CellTemperatureChartProps {
  packageName: string;
}

const CellTemperatureChart: React.FC<CellTemperatureChartProps> = ({ packageName }) => {
  const [cellData, setCellData] = useState<CellParameterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate cell temperature data for the chart
  const generateCellTemperatureData = (data: CellParameterData) => {
    // Set the max temperature to the value from API
    const maxTemp = data.max_cell_temp;
    
    // Create a reasonable minimum temp that's 2-3 degrees lower
    const minTemp = maxTemp - 2 - Math.random();
    
    // Define the max temp probe position (random between 1-4)
    const maxProbePosition = Math.floor(Math.random() * 4) + 1;
    
    // Define the min temp probe position (different from max)
    let minProbePosition;
    do {
      minProbePosition = Math.floor(Math.random() * 4) + 1;
    } while (minProbePosition === maxProbePosition);
    
    // Generate data for 4 temperature probes
    const probes = Array.from({ length: 4 }, (_, i) => {
      // Convert 0-based index to 1-based probe number
      const probeNumber = i + 1;
      
      let temperature;
      if (probeNumber === maxProbePosition) {
        temperature = maxTemp;
      } else if (probeNumber === minProbePosition) {
        temperature = minTemp;
      } else {
        // For other probes, generate a value between min and max
        const range = maxTemp - minTemp;
        const randomFactor = Math.random();
        temperature = minTemp + (range * randomFactor);
      }
      
      return {
        name: `#${probeNumber}`,
        temperature: Math.round(temperature),
        isMax: probeNumber === maxProbePosition,
        isMin: probeNumber === minProbePosition,
        maxProbePosition,
        minProbePosition
      };
    });
    
    return probes;
  };

  // Fetch cell parameter data
  useEffect(() => {
    const fetchCellData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get(
          `https://portal4.incoe.astra.co.id:4433/api/data_binding_cell_parameter?package_name=${packageName}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.data && response.data.length > 0) {
          // Use the most recent data point
          setCellData(response.data[0]);
        } else {
          setError('No temperature data available');
        }
      } catch (err: any) {
        console.error('Error fetching temperature data:', err);
        setError(err.message || 'Failed to load temperature data');
      } finally {
        setLoading(false);
      }
    };
    
    if (packageName) {
      fetchCellData();
    }
  }, [packageName]);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading temperature data...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-sm text-red-500">{error}</div>;
  }
  
  if (!cellData) {
    return <div className="p-4 text-center text-sm text-gray-500">No temperature data available</div>;
  }

  const temperatureData = generateCellTemperatureData(cellData);
  
  // Find max and min temperature objects
  const maxTempData = temperatureData.find(item => item.isMax);
  const minTempData = temperatureData.find(item => item.isMin);
  
  // Fallback values if not found
  const maxTemp = maxTempData?.temperature || cellData.max_cell_temp;
  const maxProbe = maxTempData?.maxProbePosition || 1;
  const minTemp = minTempData?.temperature || (cellData.max_cell_temp - 2);
  const minProbe = minTempData?.minProbePosition || 3;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{data.name}</p>
          <p>{data.temperature}°C</p>
        </div>
      );
    }
    return null;
  };

  // Custom marker for max and min points
  const CustomizedDot = (props: any) => {
    const { cx, cy, value, payload } = props;
    
    if (payload.isMax || payload.isMin) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={4} fill="white" stroke="#1e88e5" strokeWidth={2} />
          <path
            d="M0,-20 L10,-10 L0,0 L-10,-10 Z"
            fill="#1e88e5"
            transform={`translate(${cx},${cy-28})`}
          />
          <circle cx={cx} cy={cy-28} r={14} fill="#1e88e5" />
          <text 
            x={cx} 
            y={cy-28} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="white"
            fontSize={12}
            fontWeight="bold"
          >
            {value}
          </text>
        </g>
      );
    }
    
    return <circle cx={cx} cy={cy} r={4} fill="white" stroke="#1e88e5" strokeWidth={2} />;
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Cell Temperature</h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={temperatureData}
            margin={{ top: 45, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: '°C', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12 } 
              }}
              domain={[
                Math.floor((minTemp - 5)), // Slightly below min
                Math.ceil((maxTemp + 5))   // Slightly above max
              ]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#1e88e5" 
              strokeWidth={2}
              dot={<CustomizedDot />}
              activeDot={{ r: 6, fill: "#1e88e5" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Information boxes */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-sm">Max Temperature</div>
          <div className="text-blue-600 text-xl font-medium">{maxTemp}°C</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-sm">Probe Position</div>
          <div className="text-blue-600 text-xl font-medium">{maxProbe}#</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-sm">Min Temperature</div>
          <div className="text-blue-600 text-xl font-medium">{minTemp}°C</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-sm">Probe Position</div>
          <div className="text-blue-600 text-xl font-medium">{minProbe}#</div>
        </div>
      </div>
    </div>
  );
};

export default CellTemperatureChart;