import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * On mobile (<md): collapsible card with chevron header.
 * On desktop (md+): plain card, always expanded.
 */
export function MobileCollapsibleCard({ title, icon, badge, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader
        className="flex-row items-center gap-2 space-y-0 cursor-pointer md:cursor-default"
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <CardTitle className="text-base">{title}</CardTitle>
        {badge}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted-foreground transition-transform md:hidden ${open ? "rotate-180" : ""}`}
        />
      </CardHeader>
      <CardContent className={`${open ? "block" : "hidden"} md:block`}>{children}</CardContent>
    </Card>
  );
}
