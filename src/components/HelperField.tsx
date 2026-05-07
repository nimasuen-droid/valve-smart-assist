import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useId } from "react";
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
  const generatedId = useId();
  const controlId = htmlFor ?? `field-${generatedId}`;
  const helperId = `${controlId}-helper`;
  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const props = child.props as Record<string, unknown>;
    if (props["aria-label"] || props["aria-labelledby"]) return child;
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      id: props.id ?? controlId,
      "aria-label": label,
      "aria-describedby": props["aria-describedby"] ?? helperId,
    });
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={controlId} className="text-sm font-medium">
          {label}
        </Label>
        {reference && (
          <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-info">
            <Info className="h-3 w-3" /> {reference}
          </span>
        )}
      </div>
      {enhancedChildren}
      <p id={helperId} className="text-xs leading-relaxed text-muted-foreground">
        {helper}
      </p>
    </div>
  );
}
