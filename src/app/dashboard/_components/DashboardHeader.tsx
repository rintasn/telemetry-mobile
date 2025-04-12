// components/dashboard/DashboardHeader.tsx
import { RawDataDialog } from "./RawDataDialog";

interface DashboardHeaderProps {
  data: any;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Executive Dashboard</h2>
        <p className="text-gray-500">Summary of battery fleet performance and statistics</p>
      </div>
      
      {/* Raw Data Viewer Button */}
      <RawDataDialog data={data} />
    </div>
  );
}