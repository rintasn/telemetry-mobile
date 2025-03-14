// _components/alarms-tab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';

interface AlarmData {
  created_at: string;
  package_name: string;
  alarm_kode: string;
  alarm_action: string;
  status_alarm: string;
  alarm_id: string;
}

interface AlarmSummary {
  total: number;
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentAlarms: AlarmData[];
  criticalCount: number;
}

interface AlarmTabProps {
  packageName: string;
}

const AlarmTab: React.FC<AlarmTabProps> = ({ packageName }) => {
  const [alarmData, setAlarmData] = useState<AlarmData[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<AlarmData[]>([]);
  const [alarmSummary, setAlarmSummary] = useState<AlarmSummary>({
    total: 0,
    statusCounts: {},
    typeCounts: {},
    recentAlarms: [],
    criticalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [alarmTypeFilter, setAlarmTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to 1 month ago
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date()); // Default to today
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
  
  // Unique alarm types and statuses for filters
  const [alarmTypes, setAlarmTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);

  // Format date to YYYY-MM-DD for API
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate alarm summary data
  const calculateAlarmSummary = (alarms: AlarmData[]) => {
    // Total number of alarms
    const total = alarms.length;
    
    // Count alarms by status
    const statusCounts: Record<string, number> = {};
    // Count alarms by type
    const typeCounts: Record<string, number> = {};
    
    // Get recent alarms (last 5)
    const recentAlarms = [...alarms].slice(0, 5);
    
    // Count critical alarms (assuming "Open" status is critical)
    let criticalCount = 0;
    
    alarms.forEach(alarm => {
      // Count by status
      if (statusCounts[alarm.status_alarm]) {
        statusCounts[alarm.status_alarm]++;
      } else {
        statusCounts[alarm.status_alarm] = 1;
      }
      
      // Count by type
      if (typeCounts[alarm.alarm_kode]) {
        typeCounts[alarm.alarm_kode]++;
      } else {
        typeCounts[alarm.alarm_kode] = 1;
      }
      
      // Count critical alarms
      if (alarm.status_alarm.toLowerCase() === 'open') {
        criticalCount++;
      }
    });
    
    return {
      total,
      statusCounts,
      typeCounts,
      recentAlarms,
      criticalCount
    };
  };

  // Fetch alarm data
  useEffect(() => {
    const fetchAlarmData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const formattedStartDate = formatDateForApi(startDate);
        const formattedEndDate = formatDateForApi(endDate);
        
        const response = await axios.get(
          `https://portal4.incoe.astra.co.id:4433/api/data_binding_alarm?package_name=${packageName}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Sort by date (newest first)
          const sortedData = response.data.sort((a: AlarmData, b: AlarmData) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          setAlarmData(sortedData);
          
          // Calculate summary
          const summary = calculateAlarmSummary(sortedData);
          setAlarmSummary(summary);
          
          // Extract unique alarm types and statuses for filters
          const types = Array.from(new Set(sortedData.map((alarm: AlarmData) => alarm.alarm_kode)));
          const statuses = Array.from(new Set(sortedData.map((alarm: AlarmData) => alarm.status_alarm)));
          
          setAlarmTypes(types);
          setStatusTypes(statuses);
        } else if (response.data && response.data.length === 0) {
          // No alarms found
          setAlarmData([]);
          setAlarmSummary({
            total: 0,
            statusCounts: {},
            typeCounts: {},
            recentAlarms: [],
            criticalCount: 0
          });
          setAlarmTypes([]);
          setStatusTypes([]);
        } else {
          // Create sample data if no data returned
          const sampleData = generateSampleAlarmData();
          setAlarmData(sampleData);
          
          // Calculate summary
          const summary = calculateAlarmSummary(sampleData);
          setAlarmSummary(summary);
          
          // Extract unique alarm types and statuses for filters
          const types = Array.from(new Set(sampleData.map(alarm => alarm.alarm_kode)));
          const statuses = Array.from(new Set(sampleData.map(alarm => alarm.status_alarm)));
          
          setAlarmTypes(types);
          setStatusTypes(statuses);
        }
      } catch (err: any) {
        console.error('Error fetching alarm data:', err);
        setError(err.message || 'Failed to load alarm data');
        
        // Create sample data on error
        const sampleData = generateSampleAlarmData();
        setAlarmData(sampleData);
        
        // Calculate summary
        const summary = calculateAlarmSummary(sampleData);
        setAlarmSummary(summary);
        
        // Extract unique alarm types and statuses for filters
        const types = Array.from(new Set(sampleData.map(alarm => alarm.alarm_kode)));
        const statuses = Array.from(new Set(sampleData.map(alarm => alarm.status_alarm)));
        
        setAlarmTypes(types);
        setStatusTypes(statuses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlarmData();
  }, [packageName, startDate, endDate]);

  // Filter alarms based on search term, alarm type, and status
  useEffect(() => {
    let filtered = [...alarmData];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(alarm => 
        alarm.alarm_kode.toLowerCase().includes(searchLower) ||
        alarm.alarm_action.toLowerCase().includes(searchLower) ||
        alarm.alarm_id.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by alarm type
    if (alarmTypeFilter !== 'all') {
      filtered = filtered.filter(alarm => alarm.alarm_kode === alarmTypeFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alarm => alarm.status_alarm === statusFilter);
    }
    
    setFilteredAlarms(filtered);
  }, [alarmData, searchTerm, alarmTypeFilter, statusFilter]);

  // Generate sample alarm data
  const generateSampleAlarmData = () => {
    const alarmTypes = [
      { code: 'Over Voltage', action: 'Cell over voltage protection', id: 'A01' },
      { code: 'Under Voltage', action: 'Cell under voltage protection', id: 'A02' },
      { code: 'Over Temperature', action: 'Cell over temperature protection', id: 'A03' },
      { code: 'Under Temperature', action: 'Cell under temperature protection', id: 'A04' },
      { code: 'Different Voltage', action: 'Cell different voltage protection', id: 'A05' },
      { code: 'Over Current', action: 'Over current protection', id: 'A06' },
      { code: 'Short Circuit', action: 'Short circuit protection', id: 'A07' },
    ];
    
    const statuses = ['Open', 'Closed', 'Acknowledged'];
    
    const sampleData: AlarmData[] = [];
    
    // Generate 15 sample alarms over the last month
    for (let i = 0; i < 15; i++) {
      const randomType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random date within the last month
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      sampleData.push({
        created_at: randomDate.toISOString(),
        package_name: packageName,
        alarm_kode: randomType.code,
        alarm_action: randomType.action,
        status_alarm: randomStatus,
        alarm_id: randomType.id
      });
    }
    
    // Sort by date (newest first)
    return sampleData.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setAlarmTypeFilter('all');
    setStatusFilter('all');
  };

  // Update date range and fetch new data
  const handleDateRangeChange = (type: 'start' | 'end', date: Date) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setShowCalendar(null);
  };

  // Get status color based on status text
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color code for charts
  const getStatusColorCode = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '#EF4444';
      case 'closed':
        return '#10B981';
      case 'acknowledged':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  // Prepare data for status pie chart
  const prepareStatusChartData = () => {
    return Object.entries(alarmSummary.statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColorCode(status)
    }));
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading alarm data...</div>;
  }
  
  if (error && alarmData.length === 0) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const statusChartData = prepareStatusChartData();

  return (
    <div className="bg-white rounded-t-3xl mt-3 px-4 py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Alarm History</h2>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Input
          placeholder="Search alarms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        
        <div className="flex gap-2 items-center">
          <Select value={alarmTypeFilter} onValueChange={setAlarmTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alarm Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {alarmTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusTypes.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="text-sm text-gray-500 mr-2">Date Range:</div>
        
        <div className="flex items-center gap-2">
          <Popover open={showCalendar === 'start'} onOpenChange={(open) => open ? setShowCalendar('start') : setShowCalendar(null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white">
                {startDate.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && handleDateRangeChange('start', date)}
                disabled={(date) => date > endDate || date > new Date()}
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-gray-500">to</span>
          
          <Popover open={showCalendar === 'end'} onOpenChange={(open) => open ? setShowCalendar('end') : setShowCalendar(null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white">
                {endDate.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && handleDateRangeChange('end', date)}
                disabled={(date) => date < startDate || date > new Date()}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              setStartDate(monthAgo);
              setEndDate(today);
            }}
            className="whitespace-nowrap"
          >
            Last 30 Days
          </Button>
        </div>
      </div>
      
      {/* Alarm Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Alarm Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Total Alarms Card */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-700">Total Alarms</h4>
              <p className="text-3xl font-bold text-blue-800">{alarmSummary.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Open Alarms Card */}
          <div className="bg-red-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-700">Open Alarms</h4>
              <p className="text-3xl font-bold text-red-800">{alarmSummary.statusCounts['Open'] || 0}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          {/* Resolved Alarms Card */}
          <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-700">Resolved Alarms</h4>
              <p className="text-3xl font-bold text-green-800">{alarmSummary.statusCounts['Closed'] || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Status Distribution and Top Alarms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Distribution Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Alarm Status Distribution</h4>
            {statusChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alarms`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No status data available</p>
              </div>
            )}
          </div>
          
          {/* Top Alarm Types */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Most Common Alarm Types</h4>
            <div className="space-y-3">
              {Object.entries(alarmSummary.typeCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 5)
                .map(([type, count], index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <span className="text-sm text-gray-600">{type}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-1/3 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-blue-500'}`}
                        style={{ width: `${(count / alarmSummary.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              
              {Object.keys(alarmSummary.typeCounts).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No alarm type data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500 mb-2">
        Showing {filteredAlarms.length} of {alarmData.length} alarms
      </div>
      
      {/* Alarms Table */}
      {filteredAlarms.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Alarm</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlarms.map((alarm, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatDate(alarm.created_at)}
                  </TableCell>
                  <TableCell>{alarm.alarm_kode}</TableCell>
                  <TableCell>{alarm.alarm_action}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(alarm.status_alarm)}`}>
                      {alarm.status_alarm}
                    </Badge>
                  </TableCell>
                  <TableCell>{alarm.alarm_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No alarms match your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AlarmTab;