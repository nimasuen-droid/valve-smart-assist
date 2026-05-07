# Valve Smart Assist Change Plan

## Current State

The app is a local-first React 19 / TanStack Start / Vite application for industrial valve selection. It already includes a guided wizard, a rule-based valve selection engine, ASME B16.5 pressure-temperature checks, preliminary IEC 60534 control valve sizing, local saved selections, reference/manual pages, and datasheet export helpers.

The core workflow is:

1. Capture project, line, service, design, valve function, material, end connection, and special requirement inputs.
2. Run `src/lib/valveSelectionEngine.js` to recommend valve type, subtype, materials, end connections, operator, packing, gasket, fire-safe status, standards, warnings, alternatives, and rationale.
3. Run `src/lib/asmeB165Ratings.js` to recommend/check ASME B16.5 pressure class for carbon steel Group 1.1.
4. Run `src/lib/sizing.ts` for preliminary IEC 60534 sizing when the selected function is throttling/control.
5. Present the result in `/wizard/type` and `/report`, with override tracking and export options.

## Environment Notes

- npm is the selected package manager for this workspace.
- Dependencies were installed with lifecycle scripts enabled using a workspace-local npm CLI driven by the available Codex `node.exe`.
- `package-lock.json` is the retained lockfile. The stale Bun lockfile was removed.
- Build and lint verification should be run with npm.

## Recommended Change Plan

### 1. Stabilize The Development Baseline

- Use npm as the standard package manager for this workspace.
- Re-run clean dependency installs without `--ignore-scripts`.
- Keep `package-lock.json` as the lockfile.
- Run `npm run build` and `npm run lint`.
- Fix any build, lint, or generated route-tree issues before feature work.

### 2. Fix Text Encoding And Content Polish

- Keep all source files, docs, and generated HTML strings as UTF-8.
- Use correct engineering symbols for dash, degree, less-than-or-equal, greater-than-or-equal, delta, mu, pi, and arrows.
- Prefer icon components over raw decorative glyphs in interactive UI controls.
- Keep numeric temperature notation consistent, for example `425 °C`.
- Keep datasheet exports consistent with the same notation used in the UI.

### 3. Strengthen Engineering Data Coverage

- Expand ASME B16.5 pressure-temperature ratings beyond Group 1.1 / A216 WCB.
- Add material group selection tied to the chosen body material.
- Add ASME B16.34 checks for valve body ratings, including high-temperature alloy cases.
- Add traceable source metadata for each rating table and rule group.

### 4. Improve Control Valve Sizing

- Complete the sizing verdict path in `src/lib/sizing.ts` so `runSizing` can return the evaluated verdict directly or document why `evaluateAgainstValve` is always separate.
- Add cavitation, flashing, and aerodynamic noise checks.
- Add more valve/body/trim Cv data and label it clearly as preliminary/vendor-dependent.
- Add validation for impossible pressure-drop cases, especially gas pressure drop ratios and liquid vapor pressure edge cases.

### 5. Add Automated Tests Around The Engines

- Add unit tests for valve type selection across service, size, and function combinations.
- Add unit tests for ASME B16.5 class recommendation and rating warnings.
- Add unit tests for IEC 60534 liquid and gas sizing examples.
- Add unit tests for override application in `useSelectionResult`.
- Include regression fixtures using the existing sample cases.
- Prioritize engine tests before UI tests because the app is decision-support software.

### 6. Improve Report And Export Quality

- Convert the current print/HTML PDF flow into a more reliable PDF export path.
- Add a formal datasheet revision/status block.
- Include override reasons, warnings, assumptions, and references in a clear audit section.
- Add project metadata and line data consistently to HTML, print/PDF, and Excel outputs.

### 7. Prepare For Shared Project Workflows

- Keep localStorage for offline use, but introduce a storage abstraction before adding cloud sync.
- Add import/export of saved selections as JSON.
- Later, add optional cloud sync, multi-user project workspaces, review status, and approval history.

## First Implementation Slice

The best first slice is baseline stabilization plus tests:

1. Standardize package management and regenerate the chosen lockfile.
2. Run build/lint in a normal terminal and fix failures.
3. Normalize text encoding.
4. Add unit tests for `asmeB165Ratings.js`, `sizing.ts`, and `valveSelectionEngine.js`.
5. Only then start expanding engineering datasets and report export behavior.
