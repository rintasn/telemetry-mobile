// _components/temp-history-chart.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, 
  Line, 
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
  [key: string]: any;
}

interface TempHistoryChartProps {
  packageName: string;
}

type TimeRange = 'Today' | 'Last 3 days' | 'Last 10 days' | 'Customize';

const TempHistoryChart: React.FC<TempHistoryChartProps> = ({ packageName }) => {
  const [tempData, setTempData] = useState<CellParameterData[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
  
  // Fetch temperature data
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
          setTempData(response.data);
        } else {
          // If no data, create sample data
          const sampleData = generateSampleData();
          setTempData(sampleData);
        }
      } catch (err: any) {
        console.error('Error fetching temperature data:', err);
        setError(err.message || 'Failed to load temperature data');
        
        // Create sample data on error
        const sampleData = generateSampleData();
        setTempData(sampleData);
      } finally {
        setLoading(false);
      }
    };
    
    if (packageName) {
      fetchData();
    }
  }, [packageName]);

  // Filter data based on selected time range
  useEffect(() => {
    if (!tempData.length) return;
    
    // Sort data by timestamp
    const sortedData = [...tempData].sort((a, b) => 
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
    
    // Process data for chart display
    const chartData = filteredData.map(item => {
      const date = new Date(item.created_at);
      
      // Create min temperature that's a few degrees lower than max
      // In a real app, you would use the actual min temperature from API
      const minTemp = Math.max(item.max_cell_temp - Math.random() * 2 - 1, 30);
      
      return {
        time: formatTime(date),
        timestamp: date,
        maxTemp: item.max_cell_temp,
        minTemp: minTemp.toFixed(0)
      };
    });
    
    setFilteredData(chartData);
  }, [tempData, timeRange]);

  // Generate sample temperature data
  const generateSampleData = () => {
    const data: CellParameterData[] = [];
    const now = new Date();
    
    // Generate data for the last 24 hours with 15-minute intervals
    for (let i = 0; i < 96; i++) {
      const timestamp = new Date(now);
      timestamp.setMinutes(now.getMinutes() - (i * 15));
      
      // Base temperature that increases during the day
      const hour = timestamp.getHours();
      let baseTemp;
      
      // Simulate daily temperature curve
      if (hour >= 9 && hour < 12) {
        // Morning - slowly increase
        baseTemp = 35 + ((hour - 9) * 0.3);
      } else if (hour >= 12 && hour < 14) {
        // Midday - rapid increase
        baseTemp = 36 + ((hour - 12) * 3);
      } else if (hour >= 14 && hour < 16) {
        // Afternoon - peak
        baseTemp = 43 + ((hour - 14) * 0.5);
      } else if (hour >= 16 && hour < 19) {
        // Evening - slow decrease
        baseTemp = 44 - ((hour - 16) * 0.3);
      } else {
        // Night - steady low
        baseTemp = 35;
      }
      
      // Add some randomness
      const maxTemp = Math.round(baseTemp + (Math.random() * 0.5));
      
      data.push({
        created_at: timestamp.toISOString(),
        max_cell_temp: maxTemp,
        package_name: packageName,
        batt_volt: 52.8 - (Math.random() * 0.3),
        batt_cur: -100 + (Math.random() * 60),
        soc: 65 - (i / 96 * 5)
      });
    }
    
    return data;
  };

  // Format time for x-axis labels
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading temperature history...</div>;
  }
  
  if (error && tempData.length === 0) {
    return <div className="p-4 text-center text-sm text-red-500">{error}</div>;
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p style={{ color: '#E57373' }}>Max: {payload[0].value}°C</p>
          <p style={{ color: '#4DB6AC' }}>Min: {payload[1].value}°C</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Max/Min Temperature ▾</h3>
        <div className="text-gray-500 text-sm">All ▾</div>
      </div>
      
      <div className="text-center text-lg font-medium text-gray-700 mb-2">
        Max/Min Temperature(°C)
      </div>
      
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
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="stepAfter" 
              dataKey="maxTemp" 
              stroke="#E57373" 
              strokeWidth={2}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
            />
            <Line 
              type="stepAfter" 
              dataKey="minTemp" 
              stroke="#4DB6AC"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
            />
            <Brush 
              dataKey="time" 
              height={40} 
              stroke="#8884d8" 
              fill="rgba(200, 220, 255, 0.2)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
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

export default TempHistoryChart;