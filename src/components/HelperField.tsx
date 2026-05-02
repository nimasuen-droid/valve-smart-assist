import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface HelperFieldProps {
  label: string;
  helper: string;
  htmlFor?: string;
  reference?: string;
  children: ReactNode;
}

export function HelperField({ label, helper, htmlFor, reference, children }: HelperFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </Label>
        {reference && (
          <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-info">
            <Info className="h-3 w-3" /> {reference}
          </span>
        )}
      </div>
      {children}
      <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p>
    </div>
  );
}
