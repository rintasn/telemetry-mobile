// components/dashboard/BatteryLocationMap.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Wifi } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BatteryData {
  package_name: string;
  id_user: string;
  status_binding: string;
  serial_number: string;
  manufacturer: string;
  brand: string;
  rated_voltage: string;
  rated_capacity: string;
  rated_energy: string;
  discharge_working_hours: string;
  charge_working_hours: string;
  idle_working_hours: string;
  cycle_charge: string;
  total_discharge_ah: string;
  batt_wh_charge: string;
  batt_wh_discharge: string;
  charging_cycle: string;
  total_charge_ah: string;
  batt_volt: string;
  batt_cur: string;
  soc: string;
  soh: string;
  max_cell_volt: string;
  max_cv_no: string;
  min_cell_volt: string;
  min_cv_no: string;
  max_cell_temp: string;
  batt_wh: string;
  batt_ah: string;
  working_hour_telemetri: string;
  charging_hour_telemetri: string;
  software_version: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  signal: number;
}

interface BatteryLocationMapProps {
  data: BatteryData[];
}

// Helper function to get signal category color
function getSignalColor(signal: number): string {
  if (signal === undefined || signal === null || signal <= 0) return "#888";  // gray
  if (signal <= 7) return "#dc2626";  // red
  if (signal <= 15) return "#f97316";  // orange
  if (signal <= 23) return "#16a34a";  // green
  return "#2563eb";  // blue
}

// Helper function to get signal category name
function getSignalCategory(signal: number): string {
  if (signal === undefined || signal === null || signal <= 0) return "No Signal";
  if (signal <= 7) return "Poor";
  if (signal <= 15) return "Fair";
  if (signal <= 23) return "Good";
  return "Excellent";
}

export function BatteryLocationMap({ data }: BatteryLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Filter batteries with location data
  const batteriesWithLocation = useMemo(() => {
    return data.filter(battery => 
      battery.latitude !== undefined && 
      battery.longitude !== undefined && 
      (battery.latitude !== 0 || battery.longitude !== 0)
    );
  }, [data]);

  // Calculate center of map (average of all coordinates)
  const mapCenter = useMemo(() => {
    if (batteriesWithLocation.length === 0) return { lat: 0, lng: 0 };
    
    const sum = batteriesWithLocation.reduce(
      (acc, battery) => {
        return {
          lat: acc.lat + (battery.latitude || 0),
          lng: acc.lng + (battery.longitude || 0)
        };
      },
      { lat: 0, lng: 0 }
    );
    
    return {
      lat: sum.lat / batteriesWithLocation.length,
      lng: sum.lng / batteriesWithLocation.length
    };
  }, [batteriesWithLocation]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || batteriesWithLocation.length === 0) return;

    // Prevent multiple map initializations
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    // Fix Leaflet icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Initialize map
    const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], 5);
    leafletMapRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for each battery
    batteriesWithLocation.forEach((battery) => {
      const signalColor = getSignalColor(battery.signal);
      const signalCategory = getSignalCategory(battery.signal);
      
      // Create custom marker
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background-color: ${signalColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
        ">${battery.package_name.charAt(0)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      // Add marker with popup
      const marker = L.marker([battery.latitude, battery.longitude], { icon: customIcon }).addTo(map);
      
      // Create popup content
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${battery.package_name}</h3>
          <p style="margin: 2px 0; color: #666;">SN: ${battery.serial_number}</p>
          <p style="margin: 2px 0;">Brand: ${battery.brand}</p>
          <p style="margin: 2px 0;">SOC: ${battery.soc}%</p>
          <p style="margin: 2px 0;">SOH: ${battery.soh}%</p>
          <p style="margin: 2px 0; color: ${signalColor};">
            Signal: ${signalCategory} (${battery.signal})
          </p>
          <p style="margin: 5px 0 0; font-style: italic; font-size: 0.8em;">
            Lat: ${battery.latitude}, Lng: ${battery.longitude}
          </p>
        </div>
      `);
    });

    // Clean up map on component unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [batteriesWithLocation, mapCenter]);

  // If no batteries have location data
  if (batteriesWithLocation.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Battery Locations</CardTitle>
          <CardDescription>
            Geographic distribution of battery devices
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
          <MapPin className="h-10 w-10 mb-2 text-gray-300" />
          <p>No location data available for any battery</p>
          <p className="text-sm">Location information will appear here when available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battery Locations</CardTitle>
        <CardDescription>
          Geographic distribution of battery devices ({batteriesWithLocation.length} with location data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-96 border rounded-md overflow-hidden"></div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Signal Quality Legend</h4>
          <div className="flex mb-4 flex-wrap">
            <div className="flex items-center mr-4 mb-2 text-xs">
              <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1"></span>
              <span>Poor (0-7)</span>
            </div>
            <div className="flex items-center mr-4 mb-2 text-xs">
              <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
              <span>Fair (8-15)</span>
            </div>
            <div className="flex items-center mr-4 mb-2 text-xs">
              <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
              <span>Good (16-23)</span>
            </div>
            <div className="flex items-center mr-4 mb-2 text-xs">
              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-1"></span>
              <span>Excellent (24-31)</span>
            </div>
            <div className="flex items-center mb-2 text-xs">
              <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
              <span>No Signal</span>
            </div>
          </div>
          
          <h4 className="text-sm font-medium text-gray-500 mb-2">Batteries with Location Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {batteriesWithLocation.map((battery) => (
              <div 
                key={battery.serial_number} 
                className="flex items-center p-2 border rounded-md"
              >
                <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                <span className="font-medium mr-1">{battery.package_name}</span>
                <span className="text-gray-500 truncate mr-2">({battery.serial_number})</span>
                <Wifi 
                  style={{ color: getSignalColor(battery.signal) }}
                  className="h-3 w-3 mr-1" 
                />
                <span 
                  style={{ color: getSignalColor(battery.signal) }}
                >
                  {getSignalCategory(battery.signal)} ({battery.signal})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}