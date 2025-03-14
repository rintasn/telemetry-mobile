import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BMS - Telemetri",
  description: "Telemetri Lithium Cell Battery Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/x-icon" />
        {/* You can also use other formats like PNG */}
        {/* <link rel="icon" href="/favicon.png" type="image/png" /> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
