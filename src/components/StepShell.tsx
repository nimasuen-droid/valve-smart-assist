import { ReactNode, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WizardNav } from "./WizardNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/lib/SelectionContext";
import { toast } from "sonner";

interface StepShellProps {
  step: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  aside?: ReactNode;
}

// Mobile flow — simplified 5-step (Sizing only when throttling)
function useMobileSteps(currentStep: string) {
  const { input } = useSelection();
  const isThrottling = input.valveFunction === "Throttling / Control";

  return useMemo(() => {
    const steps: { url: string; label: string }[] = [
      { url: "/wizard/project", label: "Line Data" },
      { url: "/wizard/conditions", label: "Service Conditions" },
      { url: "/wizard/function", label: "Valve Function" },
      { url: "/wizard/type", label: "Valve Type & Override" },
    ];
    if (isThrottling) steps.push({ url: "/wizard/sizing", label: "Sizing" });
    steps.push({ url: "/report", label: "Results" });
    const idx = steps.findIndex((s) => s.url === currentStep);
    return { steps, idx, isThrottling };
  }, [isThrottling, currentStep]);
}

function validateStep(
  step: string,
  input: ReturnType<typeof useSelection>["input"],
): string | null {
  switch (step) {
    case "/wizard/project":
      if (!input.tagNumber?.trim()) return "Enter a valve tag number to continue.";
      if (!input.pipeSize) return "Select a pipe size.";
      if (!input.pressureClass) return "Select a pressure class.";
      return null;
    case "/wizard/conditions":
      if (!input.designPressure) return "Enter design pressure.";
      if (!input.designTemp) return "Enter design temperature.";
      return null;
    case "/wizard/function":
      if (!input.valveFunction) return "Select a valve function.";
      return null;
    case "/wizard/sizing":
      if (!input.sizingFlow || !input.sizingDp)
        return "Enter flow and pressure drop to size the valve.";
      return null;
    default:
      return null;
  }
}

export function StepShell({ step, title, subtitle, children, aside }: StepShellProps) {
  const { steps, idx } = useMobileSteps(step);
  const { input } = useSelection();
  const navigate = useNavigate();
  const total = steps.length;
  const currentMobileIdx = idx >= 0 ? idx : 0;
  const progress = ((currentMobileIdx + 1) / total) * 100;
  const prev = currentMobileIdx > 0 ? steps[currentMobileIdx - 1] : null;
  const next = currentMobileIdx < total - 1 ? steps[currentMobileIdx + 1] : null;

  const goNext = () => {
    if (!next) return;
    const err = validateStep(step, input);
    if (err) {
      toast.error(err);
      return;
    }
    navigate({ to: next.url });
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:block space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Selection Wizard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="bg-gradient-surface shadow-elevated">
            <CardHeader>
              <CardTitle className="text-base">Inputs</CardTitle>
              <CardDescription>
                Fill in what you know — defaults assumed where left blank.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {children}
              <WizardNav current={step} />
            </CardContent>
          </Card>
          <div className="space-y-4">{aside}</div>
        </div>
      </div>

      {/* Mobile layout — full-screen step */}
      <div className="md:hidden -mx-4 -mt-4 -mb-24 flex min-h-[calc(100vh-3.5rem)] flex-col">
        {/* Top progress */}
        <div className="sticky top-14 z-20 border-b border-border bg-background/95 px-4 pt-3 pb-3 backdrop-blur">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider text-primary">
              Step {currentMobileIdx + 1} of {total}
            </span>
            <span>{steps[currentMobileIdx]?.label}</span>
          </div>
          <Progress value={progress} className="mt-2 h-1.5" />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-5 pb-28">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
            {children}
          </div>
          {aside && <div className="mt-6 space-y-3">{aside}</div>}
        </div>

        {/* Fixed bottom action bar */}
        <div
          className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <div className="flex items-center justify-between gap-3">
            {prev ? (
              <Button asChild variant="outline" className="h-12 px-5 text-base">
                <Link to={prev.url}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button onClick={goNext} className="h-12 px-5 text-base">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
