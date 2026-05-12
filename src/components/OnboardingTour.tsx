import { useEffect, useLayoutEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "onboarding_completed_v1";

type Step = {
  selector: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    selector: "[data-onboarding='main']",
    title: "Welcome",
    description:
      "This is the Valve Selection Guide workspace. Start with the workflow, then review the rationale and exports.",
  },
  {
    selector: "[data-onboarding='start-selection']",
    title: "Start Selection",
    description:
      "Begin with project and line data, then move through service, valve type, materials, end connections, and checks.",
  },
  {
    selector: "[data-onboarding='quick-workflow']",
    title: "Workflow Steps",
    description: "Use these quick links to jump to inputs, recommendations, reports, and exports.",
  },
  {
    selector: "[data-onboarding='nav']",
    title: "Navigation",
    description:
      "Use navigation to move between wizard steps, saved work, references, settings, legal pages, and the user manual.",
  },
  {
    selector: "[data-onboarding='help']",
    title: "How to Use",
    description: "Click this control anytime to replay the quick guide.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function getVisibleSteps() {
  return steps.filter((step) => {
    const el = document.querySelector(step.selector);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

export function OnboardingTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const activeSteps = typeof document === "undefined" ? [] : getVisibleSteps();
  const step = activeSteps[Math.min(stepIndex, Math.max(activeSteps.length - 1, 0))];

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    const updateRect = () => {
      const el = document.querySelector(step.selector);
      if (!el) {
        setRect(null);
        return;
      }
      const next = el.getBoundingClientRect();
      setRect({ top: next.top, left: next.left, width: next.width, height: next.height });
    };
    document.querySelector(step.selector)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const timer = window.setInterval(updateRect, 300);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.clearInterval(timer);
    };
  }, [open, step]);

  if (!open || !step) return null;

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  };
  const next = () => {
    if (stepIndex >= activeSteps.length - 1) finish();
    else setStepIndex(stepIndex + 1);
  };

  const cardWidth = Math.min(340, window.innerWidth - 24);
  const cardHeight = 170;
  const padding = 12;
  let cardTop = window.innerHeight / 2 - cardHeight / 2;
  let cardLeft = window.innerWidth / 2 - cardWidth / 2;

  if (rect) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    cardTop =
      spaceBelow > cardHeight + padding + 20
        ? rect.top + rect.height + padding
        : Math.max(padding, rect.top - cardHeight - padding);
    cardLeft = Math.min(
      Math.max(padding, rect.left + rect.width / 2 - cardWidth / 2),
      window.innerWidth - cardWidth - padding,
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <div className="pointer-events-auto absolute inset-0 bg-black/45" onClick={finish} />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-md transition-all duration-200"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            border: "2px solid hsl(142 70% 45%)",
            boxShadow: "0 0 0 4px hsl(142 70% 45% / 0.35), 0 0 18px 2px hsl(142 70% 45% / 0.55)",
          }}
        />
      )}
      <div
        className="pointer-events-auto absolute rounded-lg border border-primary/60 bg-primary p-4 text-primary-foreground shadow-xl"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <button
          aria-label="Close"
          onClick={finish}
          className="absolute top-2 right-2 opacity-80 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-1 text-xs opacity-80">
          Step {stepIndex + 1} of {activeSteps.length}
        </div>
        <div className="mb-1 text-sm font-semibold">{step.title}</div>
        <div className="mb-4 text-xs leading-5 opacity-90">{step.description}</div>
        <div className="flex items-center justify-between gap-2">
          <button onClick={finish} className="rounded-md px-3 py-1.5 text-xs hover:bg-white/10">
            Skip
          </button>
          <button
            onClick={next}
            className="rounded-md bg-primary-foreground px-3 py-1.5 text-xs font-medium text-primary"
          >
            {stepIndex >= activeSteps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  return {
    open,
    start: () => setOpen(true),
    close: () => setOpen(false),
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      setOpen(true);
    },
  };
}
