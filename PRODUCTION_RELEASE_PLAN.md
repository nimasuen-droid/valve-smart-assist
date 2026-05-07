# Valve Smart Assist - Production Release Plan

## Audit Summary

Date: 2026-05-06
Local app tested at: http://127.0.0.1:5188

The release-readiness audit covered the full rendered app, the primary valve-selection workflow, manual/help content, saved selections, exports, mobile layout, and engineering data integrity across all 12 sample cases.

## Passed Checks

- Production build passes with `npm run build`.
- Lint passes with `npm run lint`.
- All app routes render without visible mojibake, `undefined`, `NaN`, or horizontal overflow.
- Desktop workflow passes from dashboard to sample data, wizard modules, report, save, and exports.
- Mobile workflow sanity passes on dashboard, wizard, sizing, report, manual, and settings.
- Report shows recommendation, ASME material group, B16.5 rating table, B16.34 body basis, and decision-support disclaimer.
- Datasheet HTML, Excel, and print/PDF paths include ASME and B16.34 basis metadata.
- Saved selections persist to local storage and are visible from the Saved Selections page.
- User Manual covers start flow, sizing, report/export, saved selections, references, settings, and engineering verification expectations.
- All 12 sample cases return required recommendation fields, material groups, B16.34 source metadata, and pressure-class recommendations.

## Current Release Risks

1. Engineering data is still screening-grade.
   The ASME B16.5 and B16.34 datasets include traceable source labels, but they must be validated against licensed/current ASME tables before production use.

2. App is local-storage only.
   Saved selections are browser-local. There is no authenticated project store, audit log, revision history, or multi-user review trail.

3. Export quality needs acceptance testing.
   HTML and Excel exports contain the right metadata, but they need formal review for title block completeness, revision control, checker/approver fields, and client deliverable formatting.

4. Bundle-size warning remains.
   The build passes, but Vite reports large chunks. This is not a blocker for local/offline use, but production should code-split the router/app shell.

5. No automated regression suite exists yet.
   The audit used scripted browser checks, but those checks are not committed as a repeatable CI test suite.

## Phase 1-6 Execution Update

Date: 2026-05-06

- Phase 1 progressed with versioned ASME screening dataset metadata, material-group governance checks, B16.5/B16.34 source metadata propagation into reports/exports, and an automated governance gate. Full production validation remains blocked until licensed/current ASME tables are provided and independently reviewed.
- Phase 1 now includes a user-owned ASME table workflow: users can download a JSON template, populate it from their licensed ASME sources, import it, and explicitly approve it before the app uses it as the active calculation basis. Licensing and data accuracy remain the user's responsibility.
- Phase 2 progressed with deterministic sample-case and boundary checks in `npm test`; all 12 sample cases now validate recommendation completeness, ASME material group coverage, B16.34 source metadata, pressure-class recommendation availability, and text/data hygiene.
- Phase 3 progressed with issue-readiness logic that blocks report export when user overrides lack engineering justification while still allowing draft save.
- Phase 4 progressed with datasheet/report export metadata for ASME material group, B16.5 table basis, B16.34 body basis, dataset status, and release gate notes.
- Phase 5 progressed with local snapshot import/export scaffolding and saved-selection restore behavior for offline traceability.
- Phase 6 progressed with repeatable scripts for data integrity (`npm test`), E2E route/workflow smoke (`npm run test:e2e`), and release gating (`npm run release:check`).

Latest verification:

- `npm run lint` passed.
- `npm test` passed: 12 sample cases, 7 material groups, screening dataset metadata enforced.
- `npm run build` passed with the existing large chunk warning.
- `npm run test:e2e` passed: 13 routes, sample workflow/report metadata smoke, no captured console issues.

## Production-Grade Release Plan

### Phase 1 - Engineering Data Governance

- Validate every ASME B16.5 pressure-temperature table against the licensed/current standard.
- Validate B16.34 material group mappings for each supported ASTM valve body grade.
- Add source metadata fields for standard edition, table number, data owner, reviewer, and last verification date.
- Mark any approximate or conservative screening curve as "screening only" in UI and exports.
- Add test cases for high-temperature alloy services, cryogenic services, sour service, oxygen service, and high-pressure classes.

### Phase 2 - Recommendation Integrity

- Add deterministic regression tests for all sample cases.
- Add boundary tests for pressure class, temperature limits, body material group changes, and override warnings.
- Add validation for mismatched user overrides, such as stainless material with carbon-steel ASTM grade.
- Add a report confidence section that separates "engine recommendation", "screening checks", and "required engineer verification".

### Phase 3 - Workflow And Usability

- Add a guided first-run sample case and clearer "start from sample" path.
- Add per-step completion status on desktop and mobile.
- Add stronger inline validation for pressure, temperature, pipe size, and missing tag data.
- Improve override UX by requiring an engineering reason before issuing/exporting an overridden recommendation.
- Add empty, loading, and error states for all pages.

### Phase 4 - Export And Deliverables

- Formalize the datasheet title block with revision, prepared by, checked by, approved by, date, project, client, line class, and document number.
- Add a generated "basis of recommendation" appendix with standards, material group, P-T checks, warnings, and rejected alternatives.
- Add export regression tests that parse HTML/Excel output and confirm critical fields are present.
- Add PDF print stylesheet acceptance checks for page breaks and mobile/desktop consistency.

### Phase 5 - Persistence, Audit, And Collaboration

- Replace browser-only saved selections with a project store when production collaboration is required.
- Add revision history and immutable snapshots for issued recommendations.
- Add reviewer status: draft, issued for review, approved, rejected, superseded.
- Add import/export of selection JSON for offline backup and traceability.

### Phase 6 - Quality Gates And Release Operations

- Commit a Playwright or equivalent E2E suite covering routes, mobile, sample workflow, save, exports, and report metadata.
- Add CI gates for lint, build, route generation, unit tests, data tests, and E2E smoke tests.
- Add accessibility checks for keyboard navigation, focus order, labels, contrast, and screen-reader names.
- Add production monitoring for runtime errors if deployed as a hosted app.
- Add versioned release notes tied to dataset version and engineering data verification status.

## Recommended Release Gate

Do not label the app production-grade for procurement or fabrication use until Phase 1 and Phase 2 are complete and independently reviewed by a qualified piping/mechanical engineer.

It is suitable now as an offline engineering decision-support prototype and screening tool, provided the current disclaimers remain visible in the UI and exports.
