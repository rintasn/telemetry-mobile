// _components/historical-charts.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import axios from 'axios';
import { Button } from "@/components/ui/button";

interface CellParameterData {
  created_at: string;
  max_cell_temp: number;
  package_name: string;
  batt_volt: number;
  batt_cur: number;
  soc: number;
  batt_wh: number;
  batt_ah: number;
  min_cell_volt: number;
  max_cell_volt: number;
  soh: number;
  [key: string]: any;
}

interface HistoricalChartsProps {
  packageName: string;
}

type TimeRange = 'Today' | 'Last 3 days' | 'Last 10 days' | 'Customize';
type ChartType = 'Temperature' | 'SOC' | 'Voltage' | 'Current' | 'Energy' | 'Capacity';

const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ packageName }) => {
  const [cellData, setCellData] = useState<CellParameterData[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
  const [chartType, setChartType] = useState<ChartType>('Temperature');
  
  // Fetch cell parameter data
  useEffect(() => {
    const fetchData = async () => {
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
          setCellData(response.data);
        } else {
          // If no data, create sample data
          const sampleData = generateSampleData();
          setCellData(sampleData);
        }
      } catch (err: any) {
        console.error('Error fetching cell data:', err);
        setError(err.message || 'Failed to load cell data');
        
        // Create sample data on error
        const sampleData = generateSampleData();
        setCellData(sampleData);
      } finally {
        setLoading(false);
      }
    };
    
    if (packageName) {
      fetchData();
    }
  }, [packageName]);

  // Filter data based on selected time range and prepare it for the selected chart type
  useEffect(() => {
    if (!cellData.length) return;
    
    // Sort data by timestamp
    const sortedData = [...cellData].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const now = new Date();
    let filteredData;
    
    if (timeRange === 'Today') {
      // Filter to only include data from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredData = sortedData.filter(d => new Date(d.created_at) >= today);
    } else if (timeRange === 'Last 3 days') {
      // Filter to include data from the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      filteredData = sortedData.filter(d => new Date(d.created_at) >= threeDaysAgo);
    } else if (timeRange === 'Last 10 days') {
      // Filter to include data from the last 10 days
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      filteredData = sortedData.filter(d => new Date(d.created_at) >= tenDaysAgo);
    } else {
      // For 'Customize', use all data
      filteredData = sortedData;
    }
    
    // Process data for chart display based on chart type
    const chartData = filteredData.map(item => {
      const date = new Date(item.created_at);
      
      // Basic time-formatted entry
      const formattedData: any = {
        time: formatTime(date),
        timestamp: date,
      };
      
      // Add custom fields based on selected chart type
      if (chartType === 'Temperature') {
        formattedData.maxTemp = item.max_cell_temp;
        formattedData.minTemp = Math.max(item.max_cell_temp - Math.random() * 2 - 1, 30).toFixed(0);
      } else if (chartType === 'SOC') {
        formattedData.soc = item.soc;
      } else if (chartType === 'Voltage') {
        formattedData.batteryVoltage = item.batt_volt;
        formattedData.maxCellVoltage = item.max_cell_volt / 1000; // Convert from mV to V
        formattedData.minCellVoltage = item.min_cell_volt / 1000; // Convert from mV to V
      } else if (chartType === 'Current') {
        formattedData.current = item.batt_cur;
      } else if (chartType === 'Energy') {
        formattedData.energy = Math.abs(item.batt_wh);
      } else if (chartType === 'Capacity') {
        formattedData.capacity = Math.abs(item.batt_ah);
      }
      
      return formattedData;
    });
    
    setFilteredData(chartData);
  }, [cellData, timeRange, chartType]);

  // Generate sample cell parameter data
  const generateSampleData = () => {
    const data: CellParameterData[] = [];
    const now = new Date();
    
    // Generate 15 days of data with multiple readings per day
    for (let day = 0; day < 15; day++) {
      // Generate 8 readings per day
      for (let reading = 0; reading < 8; reading++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(9 + reading * 2, Math.floor(Math.random() * 60), 0, 0);
        
        // Base values
        const baseTemp = 35 + (reading * 1.5) - (day * 0.2);
        const baseSoc = 80 - (reading * 2.5) - (day * 0.5);
        const baseVolt = 52 - (reading * 0.1) - (day * 0.02);
        const baseCurrent = -100 + (reading * 20) - (day * 1);
        
        // Add randomness
        const temp = Math.max(30, Math.min(50, baseTemp + (Math.random() * 2 - 1)));
        const soc = Math.max(10, Math.min(100, baseSoc + (Math.random() * 5 - 2.5)));
        const voltage = Math.max(45, Math.min(58, baseVolt + (Math.random() * 0.4 - 0.2)));
        const current = Math.max(-200, Math.min(10, baseCurrent + (Math.random() * 20 - 10)));
        
        // Cell voltages
        const avgCellVolt = voltage / 16; // 16 cells
        const maxCellVolt = Math.round((avgCellVolt + (Math.random() * 0.05)) * 1000); // in mV
        const minCellVolt = Math.round((avgCellVolt - (Math.random() * 0.05)) * 1000); // in mV
        
        // Energy and capacity
        const energy = Math.abs(voltage * current * (reading * 0.02 + 0.1));
        const capacity = energy / voltage;
        
        data.push({
          created_at: timestamp.toISOString(),
          max_cell_temp: Math.round(temp),
          package_name: packageName,
          batt_volt: parseFloat(voltage.toFixed(1)),
          batt_cur: parseFloat(current.toFixed(1)),
          soc: Math.round(soc),
          max_cell_volt: maxCellVolt,
          min_cell_volt: minCellVolt,
          batt_wh: parseFloat(energy.toFixed(2)),
          batt_ah: parseFloat(capacity.toFixed(3)),
          soh: Math.max(70, 100 - (day * 0.2) - (Math.random() * 2))
        });
      }
    }
    
    return data;
  };

  // Format time for x-axis labels
  const formatTime = (date: Date) => {
    if (timeRange === 'Today') {
      // For today, show hours and minutes
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For longer time periods, show dates
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    }
  };

  // Get chart title and Y-axis label based on selected chart type
  const getChartConfig = () => {
    switch (chartType) {
      case 'Temperature':
        return { title: 'Max/Min Temperature(°C)', yAxisLabel: '°C' };
      case 'SOC':
        return { title: 'State of Charge (%)', yAxisLabel: '%' };
      case 'Voltage':
        return { title: 'Battery Voltage (V)', yAxisLabel: 'V' };
      case 'Current':
        return { title: 'Battery Current (A)', yAxisLabel: 'A' };
      case 'Energy':
        return { title: 'Energy (Wh)', yAxisLabel: 'Wh' };
      case 'Capacity':
        return { title: 'Capacity (Ah)', yAxisLabel: 'Ah' };
      default:
        return { title: '', yAxisLabel: '' };
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading historical data...</div>;
  }
  
  if (error && cellData.length === 0) {
    return <div className="p-4 text-center text-sm text-red-500">{error}</div>;
  }
  
  const chartConfig = getChartConfig();
  
  // Render the appropriate chart based on the selected type
  const renderChart = () => {
    if (chartType === 'Temperature') {
      return (
        <>
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
              <span className="text-sm text-gray-700">Maximum temperature</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-teal-400 mr-1"></div>
              <span className="text-sm text-gray-700">Minimum temperature</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12 }}
                  label={{ value: '°C', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                />
                <Tooltip />
                <Line 
                  type="stepAfter" 
                  dataKey="maxTemp" 
                  name="Maximum Temperature"
                  stroke="#E57373" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="minTemp" 
                  name="Minimum Temperature"
                  stroke="#4DB6AC"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      );
    } else if (chartType === 'SOC') {
      return (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: '%', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              />
              <Tooltip />
              <defs>
                <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="soc" 
                name="State of Charge"
                stroke="#4CAF50" 
                fillOpacity={1}
                fill="url(#colorSoc)" 
                activeDot={{ r: 6 }}
              />
              <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartType === 'Voltage') {
      return (
        <>
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-sm text-gray-700">Battery Voltage</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
              <span className="text-sm text-gray-700">Max Cell Voltage</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
              <span className="text-sm text-gray-700">Min Cell Voltage</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'V', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="batteryVoltage" 
                  name="Battery Voltage"
                  stroke="#2196F3" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxCellVoltage" 
                  name="Max Cell Voltage"
                  stroke="#F44336"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="minCellVoltage" 
                  name="Min Cell Voltage"
                  stroke="#FFC107"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      );
    } else if (chartType === 'Current') {
      return (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                label={{ value: 'A', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="current" 
                name="Battery Current"
                stroke="#673AB7" 
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartType === 'Energy') {
      return (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                label={{ value: 'Wh', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              />
              <Tooltip />
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="energy" 
                name="Energy"
                stroke="#FF9800" 
                fillOpacity={1}
                fill="url(#colorEnergy)" 
                activeDot={{ r: 6 }}
              />
              <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartType === 'Capacity') {
      return (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                label={{ value: 'Ah', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              />
              <Tooltip />
              <defs>
                <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9C27B0" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="capacity" 
                name="Capacity"
                stroke="#9C27B0" 
                fillOpacity={1}
                fill="url(#colorCapacity)" 
                activeDot={{ r: 6 }}
              />
              <Brush dataKey="time" height={40} stroke="#8884d8" fill="rgba(200, 220, 255, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Historical Charts</h3>
        <div className="text-gray-500 text-sm">All ▾</div>
      </div>
      
      {/* Chart type selector */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {(['Temperature', 'SOC', 'Voltage', 'Current', 'Energy', 'Capacity'] as const).map((type) => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'outline'}
              className={`${
                chartType === type ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
              onClick={() => setChartType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Chart title */}
      <div className="text-center text-lg font-medium text-gray-700 mb-2">
        {chartConfig.title}
      </div>
      
      {/* Render appropriate chart */}
      {renderChart()}
      
      {/* Time range selector */}
      <div className="flex justify-center mt-4 gap-2">
        {(['Today', 'Last 3 days', 'Last 10 days', 'Customize'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            className={`rounded-md ${
              timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default HistoricalCharts;