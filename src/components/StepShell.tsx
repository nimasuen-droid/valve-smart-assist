import { ReactNode } from "react";
import { WizardNav } from "./WizardNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StepShellProps {
  step: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  aside?: ReactNode;
}

export function StepShell({ step, title, subtitle, children, aside }: StepShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Selection Wizard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="bg-gradient-surface shadow-elevated">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Fill in what you know — defaults assumed where left blank.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            <WizardNav current={step} />
          </CardContent>
        </Card>
        <div className="space-y-4">{aside}</div>
      </div>
    </div>
  );
}
