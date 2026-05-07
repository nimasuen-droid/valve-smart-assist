import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lightbulb, BookOpen, ShieldCheck, GraduationCap } from "lucide-react";

export function LearningMoment({
  title = "Learning moment",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20">
        <Lightbulb className="h-3.5 w-3.5 text-accent-foreground" />
      </div>
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground/80">
          <GraduationCap className="h-3.5 w-3.5" /> {title}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
      </div>
    </div>
  );
}

export function WhyCard({ children }: { children: ReactNode }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <CardTitle className="text-sm">Why this was selected</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export function WarningBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-warning">{title}</p>
        <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
      </div>
    </div>
  );
}

export function ReferenceBubble({ standard, note }: { standard: string; note: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-info/30 bg-info/5 p-3">
      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-info" />
      <div>
        <p className="text-xs font-semibold text-info">{standard}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

export function GuidanceCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <ShieldCheck className="h-4 w-4 text-success" />
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}
