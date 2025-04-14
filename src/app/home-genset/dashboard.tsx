// app/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GensetList from "../_components/battery-list-genset";
import QRScanner from "../_components/qr-scanner";
import { useAuth } from "../../utils/auth";
import axios from 'axios';
import useSWR from 'swr';
import { LayoutDashboard, Power } from "lucide-react";
import Link from 'next/link';

// Define the genset data structure based on the API response
interface GensetData {
  package_name: string;
  status_package: string;
  status_pln: string;
  status_genset: string;
  v_pln_r: number;
  v_pln_s: number;
  v_pln_t: number;
  v_genset_r: number;
  v_genset_s: number;
  v_genset_t: number;
  a_pln_r: number;
  a_pln_s: number;
  a_pln_t: number;
  a_genset_r: number;
  a_genset_s: number;
  a_genset_t: number;
  kw_pln_r: number;
  kw_pln_s: number;
  kw_pln_t: number;
  kw_genset_r: number;
  kw_genset_s: number;
  kw_genset_t: number;
  kwh_pln_r: number;
  kwh_pln_s: number;
  kwh_pln_t: number;
  kwh_genset_r: number;
  kwh_genset_s: number;
  kwh_genset_t: number;
  fq_pln_r: number;
  fq_pln_s: number;
  fq_pln_t: number;
  fq_genset_r: number;
  fq_genset_s: number;
  fq_genset_t: number;
  pf_pln_r: number;
  pf_pln_s: number;
  pf_pln_t: number;
  pf_genset_r: number;
  pf_genset_s: number;
  pf_genset_t: number;
  updated_at: string;
}

// Define the API response type
type ApiResponse = GensetData[];

// Create a fetcher function with proper JWT handling
const fetcher = (url: string) => {
  // Get token from auth util
  const token = sessionStorage.getItem('token');
  
  if (!token) {
    // If no token, throw an error that SWR will catch
    return Promise.reject(new Error('No authentication token found'));
  }
  
  return axios.get<ApiResponse>(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(res => res.data);
};

export default function Home() {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { isAuthenticated, isLoading, userId, username, logout } = useAuth();
  
  // Don't fetch data until authentication is checked and user is authenticated
  const shouldFetch = isAuthenticated && userId !== null;
  
  // Fetch battery data using SWR
  const { data, error, isLoading: isDataLoading, mutate } = useSWR<ApiResponse>(
    shouldFetch ? `https://portal4.incoe.astra.co.id:4433/api/data_binding_genset?id_user=${userId}` : null,
    fetcher
  );

  // Open QR scanner modal
  const openQRScanner = () => {
    console.log("Opening QR scanner...");
    setIsQRScannerOpen(true);
  };

  // Handle successful battery binding
  const handleBindingSuccess = () => {
    // Refetch the battery list data
    mutate();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-500 p-4 flex items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">👤</span>
          </div>
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">INCOE LITHIUM</h1>
          <p className="text-white text-sm">Welcome, {username || 'User'}</p>
        </div>
        <div className="ml-auto flex gap-4">
          <button 
            onClick={logout}
            className="text-white hover:text-blue-200 text-sm bg-blue-600 px-3 py-1 rounded"
          >
            Logout
          </button>
          <div className="w-8 h-8 bg-transparent border-2 border-white rounded flex items-center justify-center">
            <span className="text-white">⤢</span>
          </div>
          <div className="w-8 h-8 bg-transparent border-2 border-white rounded flex items-center justify-center">
            <span className="text-white">≡</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Bind Battery Section */}
        <Card className="shadow-sm mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-medium text-gray-700">
                Bound Devices
              </CardTitle>
              <CardDescription>
                Manage your connected lithium batteries
              </CardDescription>
              <Link className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-50" href="/home"><LayoutDashboard className="h-4 w-4" />Battery</Link>
            <Link className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-50" href="/home-genset"><Power className="h-4 w-4" />Genset</Link>
            </div>
            <Button 
              onClick={openQRScanner}
              className="bg-green-500 hover:bg-green-600 h-10 w-10 p-0 rounded-full"
              title="Scan QR Code to bind new battery"
            >
              <span className="text-xl">📱</span>
            </Button>
          </CardHeader>
          <CardContent>
            {isDataLoading && (
              <div className="flex justify-center py-8">
                <p className="text-gray-500">Loading device data...</p>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center py-8 flex-col items-center">
                <p className="text-red-500 mb-2">Error loading device data</p>
                <p className="text-sm text-gray-500 mb-2">{error.message}</p>
                <button 
                  onClick={() => window.location.href = "/login"}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Back to Login
                </button>
              </div>
            )}
            
            {data && data.length === 0 && (
              <div className="flex justify-center py-8 flex-col items-center">
                <p className="text-gray-500 mb-4">No devices bound to your account.</p>
                <Button 
                  onClick={openQRScanner}
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  <span>📱</span>
                  <span>Bind Your First Battery</span>
                </Button>
              </div>
            )}
            
            {data && data.length > 0 && <GensetList genset={data} />}
          </CardContent>
        </Card>
      </div>
      
      {/* QR Scanner Modal */}
      <QRScanner
        open={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSuccess={handleBindingSuccess}
      />
    </main>
  );
}