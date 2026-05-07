import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APP_GOVERNANCE,
  DATASET_GOVERNANCE_NOTICE,
  STANDARDS_COPYRIGHT_NOTICE,
  USER_RESPONSIBILITY_NOTICE,
} from "@/lib/governance";

export function GovernanceBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-md border border-warning/35 bg-warning/10 p-3 text-sm text-foreground/90">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="font-semibold text-warning">{APP_GOVERNANCE.classification}</p>
          {!compact && <p className="mt-1 text-xs">{USER_RESPONSIBILITY_NOTICE}</p>}
        </div>
      </div>
    </div>
  );
}

export function ReadinessBadge() {
  return (
    <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
      {APP_GOVERNANCE.defaultReadiness}
    </Badge>
  );
}

export function GovernanceCard() {
  return (
    <Card className="border-warning/35 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-warning" />
          Governance status
          <ReadinessBadge />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-foreground/90">
        <p>{USER_RESPONSIBILITY_NOTICE}</p>
        <p className="text-xs text-muted-foreground">{STANDARDS_COPYRIGHT_NOTICE}</p>
        <p className="text-xs text-muted-foreground">{DATASET_GOVERNANCE_NOTICE}</p>
      </CardContent>
    </Card>
  );
}
