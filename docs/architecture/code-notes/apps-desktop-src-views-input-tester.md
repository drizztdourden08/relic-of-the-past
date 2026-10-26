<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/InputTester

Facts about `apps/desktop/src/views/InputTester/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

This folder now holds only the controller report dialog. The Controllers screens (directory, per-pad pages, diagnostics, logs, the HID calibration wizard and the diagnostics wizard) moved into `@drizztdourden08/brock-input`, and the report dialog reuses that package's diagnostics wizard state machine, step actions and step indicator. The app side that opens the dialog is `apps/desktop/src/controller-report/`.

## apps/desktop/src/views/InputTester/ (stylesheets)

- `ControllerReportDialog.css`: the header (title and step strip) and the footer (actions) stay put, and only the body scrolls.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useControllerReportForm.ts

- The diagnostics run (the brock-input wizard) stays open through the review step. Closing and reopening it would re-run the wizard's first step, which releases the hold, and only the positional-capture step restores it.
- `backToDiagnostics` returns to the run's summary with both captures and the restored hold intact. Nothing is re-run.
- The report description holds only what the reporter wrote. Every captured artefact goes through the `controllerReport` field.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useDetectionContext.ts

What the app knows about a device for a report bundle: the remembered name and the SDL type (both recalled from brock-input's per-session caches), and the last 20 raw HID reports from its controller input store.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useReportDiagnostics.ts

- Wires brock-input's diagnostics wizard state machine into the report. The run stays closed, so SDL keeps its hold, until the diagnostics step, and it pre-selects the report's device. The wizard's byte capture is the calibration map, and nothing here derives it again.
- There is no per-model preset. SDL's own capability report, already in the calibration map, is the identity signal, so `resolvedPreset` always reads null.

## apps/desktop/src/views/InputTester/sub-components/controller-report/ControllerReportDialog.tsx

- One persistent dialog: the step content swaps inside a fixed header and footer shell. The diagnostic portion uses brock-input's `DiagnosticsStepActions` and wizard state, the same ones its Controllers diagnostics page runs, so the report cannot drift from it.
- `window.open` on an external URL is routed to the system browser by the main process.

## apps/desktop/src/views/InputTester/sub-components/controller-report/report-step-labels/

Merges the report's steps with the dynamic step list of brock-input's wizard into one strip. The diagnostic labels come from the wizard (byte capture drops out without byte capability) and are never restated here.

## apps/desktop/src/views/InputTester/sub-components/controller-report/sub-components/

- `IntroStep` explains what the report does before asking for anything.
- `UserInfoStep` collects contact info plus the same auto-collected debug info the bug report attaches. When signed in, the account is the contact and the email and name fields go away.
- `ConfirmStep` reviews everything that will be sent. Dense sections stay collapsed, but nothing is left out.
