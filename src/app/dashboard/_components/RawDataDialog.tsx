// components/dashboard/RawDataDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "lucide-react";

interface RawDataDialogProps {
  data: any;
}

export function RawDataDialog({ data }: RawDataDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <Database className="h-4 w-4" />
          <span>View Raw Data</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Raw Battery Data</DialogTitle>
          <DialogDescription>
            Raw data from API for debugging and analysis purposes
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh]">
          <pre className="text-xs p-4 bg-gray-50 rounded-md">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}