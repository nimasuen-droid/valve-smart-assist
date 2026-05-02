import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { url: "/wizard/project", label: "Project" },
  { url: "/wizard/conditions", label: "Conditions" },
  { url: "/wizard/function", label: "Function" },
  { url: "/wizard/type", label: "Type" },
  { url: "/wizard/sizing", label: "Sizing" },
  { url: "/wizard/materials", label: "Materials" },
  { url: "/wizard/ends", label: "Ends" },
  { url: "/wizard/special", label: "Special" },
  { url: "/report", label: "Report" },
] as const;

export function WizardNav({ current }: { current: string }) {
  const idx = STEPS.findIndex((s) => s.url === current);
  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const next = idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
  const total = STEPS.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {STEPS.slice(0, -1).map((s, i) => (
          <Link
            key={s.url}
            to={s.url}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              i === idx
                ? "border-primary bg-primary/15 text-primary"
                : i < idx
                ? "border-success/40 bg-success/10 text-success"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {i + 1}. {s.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        {prev ? (
          <Button asChild variant="outline" size="sm">
            <Link to={prev.url}>
              <ArrowLeft className="h-4 w-4" /> {prev.label}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted-foreground">
          Step {idx + 1} of {total}
        </span>
        {next && (
          <Button asChild size="sm">
            <Link to={next.url}>
              {next.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
