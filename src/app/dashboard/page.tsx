// page.js
"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the Dashboard component with SSR disabled
const DashboardWithNoSSR = dynamic(
  () => import("./dashboard"),
  { ssr: false } // This prevents server-side rendering
);

export default function Page() {
  return <DashboardWithNoSSR />;
}