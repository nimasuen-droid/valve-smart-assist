# Valve Selection Guide

A decision-support web app that helps piping & process engineers screen the right industrial valve for a given service — body type, material, end connections, operator, gasket/packing, and pressure class — against the relevant international standards (API 615, ASME B16.5, ASME B16.34, IEC 60534, NACE MR0175).

> **Decision-support tool only.** All outputs are screening aids. Verify against project specs, latest standards, and a qualified piping engineer before issuing for procurement or fabrication.

---

## What the project aims to achieve

Selecting an industrial valve is a multi-variable engineering decision that today is mostly done by reading multiple standards, vendor catalogues, and tribal knowledge. This project's goal is to:

1. **Codify the selection logic** from API 615 and adjacent standards into a transparent rules engine.
2. **Validate user inputs** against ASME B16.5 P-T ratings and IEC 60534 sizing on the fly.
3. **Explain every recommendation** with an engineering rationale (basic + expert view) so the tool teaches as it screens.
4. **Work offline-first on mobile** so it is usable in the field, on a plant walkdown, or at a vendor meeting.
5. **Stay auditable** — every selection can be exported as a datasheet with its rationale and warnings attached.

---

## What has been built

### Wizard (step-by-step selection)
1. **Project** — project name, tag, client, area, line info.
2. **Conditions** — service, fluid, design temperature & pressure, location.
3. **Function** — isolation, throttling/control, check, etc. (drives whether sizing step appears).
4. **Sizing** — IEC 60534-2-1 control valve sizing (liquid/gas) with PASS / REVIEW / UNDERSIZED verdict. Only shown for throttling/control.
5. **Type** — engine recommendation + alternatives, with **ASME B16.5 P-T validation** inline. Red warning + class-override dropdown if the selected pressure class is exceeded or differs from the ASME B16.5 recommendation.
6. **Materials** — body, trim, seat, stem, packing, gasket per service & NACE MR0175.
7. **Ends** — end connection and flange standard.
8. **Special** — fire-safe, anti-static, low-emission, etc.
9. **Report** — full datasheet with rationale, warnings, references, and export.

### Engines & datasets
- **Valve selection engine** (`src/lib/valveSelectionEngine.js`) — rule-based selection per API 615, returns recommendation, alternatives, warnings, and per-field rationale (basic + expert).
- **ASME B16.5 P-T checker** (`src/lib/asmeB165Ratings.js`) — Group 1.1 (A216 WCB) ratings table with temperature derating; recommends the minimum adequate class.
- **IEC 60534 sizing** (`src/lib/sizing.ts`) — liquid & gas Cv/Kv calculation with choked-flow checks.
- **Selection state** (`src/lib/selectionState.js`) — local persistence + saved cases (no auth needed).
- **Sample cases** (`src/lib/sampleCases.ts`) — preloaded examples for demos & teaching.

### UX
- Mobile-first refactor: bottom navigation, full-screen wizard steps, fixed Back (bottom-left) / Next (bottom-right) bar.
- Per-step validation with auto-save.
- "Learning Moment" cards throughout the wizard.
- Override flow on the Type screen — user can override the engine's recommended class or valve type; overrides are flagged in the rationale and the exported datasheet.
- Manual, References, Saved selections, Settings, About/Release, EULA pages.

---

## Tech stack

- **TanStack Start v1** (React 19, file-based routing, SSR-ready)
- **Vite 7** + **TypeScript** (strict)
- **Tailwind CSS v4** with semantic design tokens in `src/styles.css`
- **shadcn/ui** + Radix primitives
- **Zod** for input validation
- **Cloudflare Workers** runtime target (via `@cloudflare/vite-plugin`)
- State persisted to `localStorage` (no backend required for the current build)

---

## Project structure

```
src/
├── routes/                  # File-based routes (TanStack)
│   ├── __root.tsx           # Root layout
│   ├── index.tsx            # Landing
│   ├── wizard.*.tsx         # Wizard steps (project → report)
│   ├── report.tsx           # Datasheet output
│   ├── saved.tsx            # Saved selections
│   ├── manual.tsx           # User manual
│   ├── references.tsx       # Standards references
│   ├── about.tsx / release.tsx / eula.tsx / settings.tsx
├── lib/
│   ├── valveSelectionEngine.js   # API 615 rules engine
│   ├── asmeB165Ratings.js        # ASME B16.5 P-T checker
│   ├── sizing.ts                 # IEC 60534-2-1 sizing
│   ├── SelectionContext.tsx      # Wizard state provider
│   ├── useSelectionResult.ts     # Combined engine + ASME hook
│   ├── selectionState.js         # localStorage persistence
│   ├── sampleCases.ts            # Demo cases
│   └── datasheetUtils.js         # Export helpers
├── components/
│   ├── StepShell.tsx             # Wizard step layout (Back/Next)
│   ├── WizardNav.tsx, MobileBottomNav.tsx, AppSidebar.tsx
│   └── ui/                       # shadcn primitives
└── styles.css                    # Tailwind v4 + design tokens (oklch)
```

---

## Getting started

Prerequisites: [Bun](https://bun.sh) (recommended) or Node 20+.

```bash
bun install
bun run dev          # http://localhost:5173
bun run build        # production build
bun run lint
bun run format
```

The app is fully client-side today — no environment variables or backend required to run locally.

---

## Where collaborators should start

| You want to… | Start here |
|---|---|
| Add a new valve type or change selection rules | `src/lib/valveSelectionEngine.js` |
| Update P-T tables or add a new material group | `src/lib/asmeB165Ratings.js` |
| Improve control-valve sizing or add cavitation/noise checks | `src/lib/sizing.ts`, `src/routes/wizard.sizing.tsx` |
| Add/modify a wizard step | `src/routes/wizard.<step>.tsx` + `src/components/StepShell.tsx` |
| Change the report / datasheet layout or export | `src/routes/report.tsx`, `src/lib/datasheetUtils.js` |
| Tweak design tokens (colors, fonts, spacing) | `src/styles.css` (define tokens in `oklch`, never hardcode colors in components) |
| Add a new top-level page | Create `src/routes/<name>.tsx` (TanStack file-based routing) |
| Add a sample case for demos/tests | `src/lib/sampleCases.ts` |

### Conventions

- **Design tokens only** — components must use semantic Tailwind classes that map to tokens in `src/styles.css`. Do not hardcode `text-white`, `bg-black`, etc.
- **TanStack Start routing** — use `@tanstack/react-router` (`Link`, `useNavigate`, etc.). Never `react-router-dom`. No trailing slashes in route paths.
- **Strict TypeScript** — every import must resolve. Create the file before importing it.
- **Rationale-first engine** — when adding a rule, also add the `basicExplanation` / `expertExplanation` and code reference so the report stays auditable.

---

## Roadmap (open for contributions)

- Expand ASME B16.5 material groups beyond Group 1.1 (currently WCB only).
- Add ASME B16.34 special-class & limited-class verification.
- Cavitation, flashing & aerodynamic noise prediction in the sizing step.
- PDF datasheet export (current export is data-only).
- Optional cloud sync (Lovable Cloud) for shared project libraries.
- Multi-user project workspaces and review/approval workflow.

---

## License

End User License Agreement is bundled in-app (`/eula`). For repository licensing, see `LICENSE` (to be added before public release).

## Support

Questions, defect reports, or dataset update requests: **nimasuen@gmail.com**

---

*Valve Selection Guide · by Nosa Imasuen*
