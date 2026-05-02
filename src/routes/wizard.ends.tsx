import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceBubble, WhyCard } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/ends")({
  head: () => ({ meta: [{ title: "End Connection / Rating — Valve Selection Guide" }] }),
  component: EndsStep,
});

function EndsStep() {
  return (
    <StepShell
      step="/wizard/ends"
      title="End Connection & Pressure Class"
      subtitle="End connection must match the line; pressure class follows ASME B16.34 P-T ratings at design temperature."
      aside={
        <>
          <WhyCard>
            For a 95 barg / 180 °C carbon-steel hydrocarbon line, CL600 RF flanged ends meet
            B16.34 with margin and align with line class A1A.
          </WhyCard>
          <ReferenceBubble standard="ASME B16.5" note="Flange dimensions & ratings, sizes ≤ NPS 24." />
          <ReferenceBubble standard="ASME B16.47" note="Large diameter flanges, NPS 26 to NPS 60." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Pipe size" helper="Nominal pipe size (NPS) of the line.">
          <Select defaultValue="8">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["1/2","1","2","3","4","6","8","10","12","16","20","24"].map(s => (
                <SelectItem key={s} value={s}>NPS {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Schedule / wall" helper="Pipe schedule for matching butt-weld bevel.">
          <Input placeholder="e.g. SCH 80" />
        </HelperField>
        <HelperField label="End connection" helper="Flanged for maintainability; BW for permanent / high-integrity service.">
          <Select defaultValue="rf">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rf">Flanged — Raised Face (RF)</SelectItem>
              <SelectItem value="rtj">Flanged — Ring Type Joint (RTJ)</SelectItem>
              <SelectItem value="bw">Butt-Weld (BW)</SelectItem>
              <SelectItem value="sw">Socket-Weld (SW)</SelectItem>
              <SelectItem value="thd">Threaded (NPT)</SelectItem>
              <SelectItem value="wafer">Wafer / Lugged</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Pressure class" helper="ASME B16.34 / B16.5 rating class." reference="B16.34">
          <Select defaultValue="600">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["150","300","600","900","1500","2500"].map(c => (
                <SelectItem key={c} value={c}>CL {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Face finish" helper="Stock RF finish 125–250 µin AARH suits spiral-wound gaskets.">
          <Select defaultValue="aarh">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aarh">125–250 µin AARH (spiral-wound)</SelectItem>
              <SelectItem value="smooth">63 µin AARH (soft gasket)</SelectItem>
              <SelectItem value="serrated">Serrated (RTJ)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Actuation" helper="Manual for rare cycling; pneumatic / electric for ESD or control.">
          <Select defaultValue="manual">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual — Lever / Gear</SelectItem>
              <SelectItem value="pneu">Pneumatic — Spring-return (ESD)</SelectItem>
              <SelectItem value="hyd">Hydraulic</SelectItem>
              <SelectItem value="elec">Electric (MOV)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
