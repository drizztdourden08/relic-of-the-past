<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/InputTester

Facts about `apps/desktop/src/views/InputTester/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/InputTester/ (stylesheets)

- `ControllerReportDialog.css` and `DiagnosticsWizardDialog.css`: the header (title and step strip) and the footer (actions) stay put, and only the body scrolls.
- `DiagnosticsWizardDialog.css`: the title shares its row with a five-step strip, and the shared header style ellipsises the title when space runs short, which cut it to a single letter. The row wraps and the title keeps its natural width.
- `DiagnosticsWizardDialog.css`: the layout overlay covers the step instead of replacing it, so the choice stays visible behind the read and the dialog does not change size mid-transition.
- `InputCalibration.css`: the card shimmer runs continuously, so a stutter means the UI thread is blocked.
- `apps/desktop/src/theme/input-calibration/hid-inputs.css`: the idle read is a real step, so its prompt carries the same weight as the live-capture readout. The change magnitude mark is drawn on the byte cell's top border so it can sit on top of any cell state, and its width and colour are set inline from the byte's own delta.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useControllerReportForm.ts

- The diagnostics run stays open through the review step. Closing and reopening it would re-run the wizard's first step, which releases the hold, and only the positional-capture step restores it.
- `backToDiagnostics` returns to the run's summary with both captures and the restored hold intact. Nothing is re-run.
- The report description holds only what the reporter wrote. Every captured artefact goes through the `controllerReport` field.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useDetectionContext.ts

What the app knows about a device for a report bundle: the remembered name, the SDL type, and the last 20 raw HID reports.

## apps/desktop/src/views/InputTester/sub-components/controller-report/behavior/useReportDiagnostics.ts

- Wires the shared diagnostics wizard state machine into the report. The run stays closed, so SDL keeps its hold, until the diagnostics step, and it pre-selects the report's device. The wizard's byte capture is the calibration map, and nothing here derives it again.
- There is no per-model preset. SDL's own capability report, already in the calibration map, is the identity signal, so `resolvedPreset` always reads null.

## apps/desktop/src/views/InputTester/sub-components/controller-report/ControllerReportDialog.tsx

- One persistent dialog: the step content swaps inside a fixed header and footer shell. The diagnostic portion is the same `DiagnosticsFlowBody` and `DiagnosticsStepActions` that the standalone diagnostics dialog renders, so the report cannot drift from it.
- `window.open` on an external URL is routed to the system browser by the main process.

## apps/desktop/src/views/InputTester/sub-components/controller-report/report-step-labels/

Merges the report's steps with the wizard's dynamic step list into one strip. The diagnostic labels come from the wizard (byte capture drops out without byte capability) and are never restated here.

## apps/desktop/src/views/InputTester/sub-components/controller-report/sub-components/

- `IntroStep` explains what the report does before asking for anything.
- `UserInfoStep` collects contact info plus the same auto-collected debug info the bug report attaches. When signed in, the account is the contact and the email and name fields go away.
- `ConfirmStep` reviews everything that will be sent. Dense sections stay collapsed, but nothing is left out.
- `ReportSection` is a collapsible text block, the same pattern as the bug report's debug info preview.
- `StepIndicator` is the persistent "where am I" strip across the report steps.

## apps/desktop/src/views/InputTester/sub-components/ControllerCard.tsx

- The pad as the game sees it: its family glyphs lit from live state, the game rumble preview, the per-device rumble strength and the raw report bytes.
- `busType` comes from the module's device snapshot and is undefined without a snapshot entry.
- `onReportDevice` is raised, not handled in the card: the report releases SDL partway through, which unmounts the card, so the screen mounts the report dialog.

## apps/desktop/src/views/InputTester/sub-components/ControllerDeviceList.tsx

- One card per `ready` device. A device SDL has not claimed is shown by the module's Controllers screen.
- The resolved family view is keyed off `entries`, which changes only on a snapshot update, not on every `controllerStates` tick (up to 60 per second).
- A device with no state yet shows an idle state of released buttons and centred axes, sized by the module's SDL button and axis names.

## apps/desktop/src/views/InputTester/sub-components/ControllerRawBytes.tsx

A collapsible raw report byte grid for a controller card.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/build-chooser-profile.ts

The calibration profile view for a resolved device, shared by the live chooser candidate and the frozen post-capture candidate in `useDiagnosticsWizardState`, which otherwise built the same `DeviceProfile` shape twice from two vendor and product sources.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/chooser-devices.ts

Step 2's device list is the union of two sources, because neither alone is honest about what is connected:

- the raw HID enumeration, which works while SDL's gamepad backend is released (step 1 onward), though a controller read through XInput and not HID (most Xbox-style pads) never appears in it;
- the SDL-claimed snapshot taken before step 1 releases the hold, the only source that ever sees an XInput-only pad, since SDL's own gamepad backend claims those independently of HID.

Byte capability comes from membership in the first list, never from a vendor or product id: present there means a raw HID open can reach the device. A chooser device's `name` is present only for a device the controller layer claimed before the run released it, since the raw enumeration reports no name of its own. Its `mapping` was captured before the release, because the mapping table cannot be queried while the gamepad subsystem is down.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useAddedDeviceNames.ts

Names for the devices offered by the choose-a-controller step. It reads the session-wide cache instead of subscribing. A device announces its name when it connects, and by the time this dialog opens the run has released every controller, so nothing announces itself again until step 4 restores them. A listener created here would see nothing and every row would read as unknown. Devices reached over a raw USB interface also report an empty OS product string, so the cache is the only place a real name is available for them.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useDeviceEntry.ts

Resolves the full `DeviceEntry` (sdlId, guid, capability flags) for a device key, kept in sync with the live SDL3 snapshot. The positional step needs the sdlId to open a joystick-level capture. The byte-level step gets by on the device key alone.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useDeviceMapping.ts

The gamecontrollerdb mapping line SDL already has loaded for a device's guid, so the choose-a-controller step shows what the real database (loaded into SDL at startup by the Brock input module, its bundled `gamecontrollerdb.txt` then `Data/input/gamecontrollerdb.txt`) knows, in place of a static lookup file this project no longer maintains.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useDiagnosticsWizardState.ts

- The central state machine for the diagnostics wizard: the active step, the device it runs against, the hold release and restore transitions steps 1 and 4 wait on, and the two capture results the final step shows side by side.
- The step 1 shutdown fires once per dialog open and again per restart via `runGeneration`, not once per visit to step 1. Going Back to step 1 and forward again must not overwrite the frozen pre-release snapshot with an already-released one.
- The captured mapping line wins over the live one, because it was read while the subsystem was still up.
- `initialDeviceKey` preselects a device for a host (the controller report) that already knows it. It falls back to the first listed device when unset or gone. Only steps 1 and 2 auto-pick a device, so the hold releasing or restoring later cannot clear the selection under a running capture.
- `activeSdlId` prefers the live entry (the id SDL reassigned on restore) and falls back to the frozen chooser entry until the live entry catches up.
- `resolvedDevice` is SDL's capability report for the live, restored device, resolved through the family layer like the calibration cards. It is null until the live entry has resolved after the restore, which the positional step treats as nothing to ask yet. `profile` builds step 2's summary panel from it, never from a per-model database.
- `capturedProfile` is built from the layout read during the one deliberate SDL window, and is frozen on purpose.
- If the dialog closes before step 4 restores the hold, the hold is put back anyway so every other controller consumer keeps working.
- Leaving the chooser reads the selected controller's real layout first and advances only once it has one. After this point SDL is down, so it is the last moment anything can ask the device what it has.
- Restart puts the hold back before the next run. Step 1 snapshots the claimed devices and sees only what is currently claimed, so restarting while still released would list nothing and drop every capability flag a claimed device carries. Step 1 reports its own failure.
- `DiagnosticsWizardState` is the hook's return shape, shared by the standalone dialog and the controller report's embedded run.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useHidListedDevices.ts

The raw HID enumeration for step 2, fetched once per wizard open. It needs no subscription: `enumerateHid` has no push side and is unaffected by the gamepad hold this wizard releases and restores.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useHoldTransition.ts

Runs one async hold transition (release or restore) whenever `active` becomes true, and tracks it as a status line: pending while in flight, done once it resolves truthy, error otherwise. `run` is a module-level store function with a stable identity, so only `active` triggers it again.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useLayoutCapture.ts

- Reads one controller's real control layout, which means briefly bringing SDL back up. Only a device SDL currently holds reports what buttons and axes it has, plus its display name and per-button labels. The rest of the run needs the subsystem down to read raw HID bytes, so the layout is fetched in a short window: restore the hold, wait for this device to be claimed and report its capabilities, then release again. The result is frozen for the rest of the run.
- Progress is reported as stages, because the window is long enough to see and a spinner with no explanation looks like a hang.
- On failure the hold is released anyway: the next step reads raw bytes and cannot while SDL holds the device.
- `awaitClaimedEntry` waits for the device to come back claimed and carrying its capabilities. Being listed is not enough: the entry appears before SDL has reported what the device can do, and reading it too early produced a control list padded with positions the pad does not have. It polls every 120 ms up to a 4000 ms cap, which exists only so a pad that never comes back cannot stall the wizard.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useStep1Shutdown.ts

- Step 1's status line: it captures the SDL-claimed device snapshot before releasing the hold, then releases it. The capture has to finish first, because SDL closes every gamepad through the normal removed path while releasing, so a later read would see nothing SDL-claimed.
- The snapshot is settled, not read once. Devices are claimed one at a time, each on its own event, so a single read catches only what is ready at that instant. That cost a controller its gyro flag and, on a restart right after the hold came back, left a reconnecting pad out of the list. `settledReadyDevices` polls every 150 ms for up to 1500 ms and stops after two quiet polls in a row.
- Bumping `runGeneration` runs the capture and release again while `active` stays true, for the summary step's "Restart on another controller".

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useSummaryExport.ts

Copy to clipboard and debug folder save for the summary step's combined payload: the byte capture and the positional records together, exactly what the summary step displays.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/useWizardNavigation.ts

Which steps are visible for the selected controller, where the run sits in them, and how it moves. The list is derived per run, since a controller with no byte capability drops that step, so neither the indicator nor Next and Back may assume a static order.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/behavior/wizard-steps.ts

The fixed wizard steps, in order. Byte capture shows only for a controller the raw HID enumeration can see. A false `hasByteCapability` drops it, for an XInput-style controller.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/DiagnosticsFlowBody.tsx

Shared by the standalone diagnostics dialog and the controller report, so both render the same steps.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/DiagnosticsWizardDialog.tsx

- Gamepad diagnostics as a modal wizard: shut SDL down, pick a controller, byte capture (byte-capable devices only), positional capture again after the hold is restored, then a summary.
- It cannot be dismissed by backdrop, Escape or close while a run is in progress, because this wizard owns whether SDL is up. Only its own Cancel, Restart and Close actions end it, and they always restore the hold.
- Cancel appears on every step so a misbehaving step is never a dead end.
- `onComplete` fires when the dialog closes with a byte capture on hand, mirroring what the standalone `HidCalibrationWizard` reported through its own `onComplete`.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/positional-capture/ (detection)

Pure functions for `usePositionalOneByOne`:

- `widestAxis` returns the axis that travelled furthest, once any has travelled far enough.
- `isAtRest` is true when no button is held that was not held at the baseline and every axis is back near its baseline value. Capturing only at rest stops one still-deflected stick from answering every remaining question.
- `detectFiredIndex` returns the first index that transitioned (a button pressed, or an axis moved past the threshold) relative to the baseline, or null while nothing new has fired.
- `trimTargetsToDevice` drops button targets whose expected index is past what the device reports. Axis targets have no expected index, so every one stays askable, and a device missing that control is answered with Skip.
- `instructionFor` phrases one target as a concrete action, with the same wording byte capture uses for a stick axis.
- `isTriggerTarget` tells triggers from sticks by id. Triggers travel one way and spring back, sticks sweep a circle, so the prompt and the completion rule differ.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/positional-capture/build-positional-targets.ts

Builds the fixed, ordered list of inputs the positional-capture step asks about: every control the connected device's `ResolvedDevice` carries, in the same face, d-pad, shoulder, stick, system and axis order the calibration cards render. SDL's own capability report decides this list, never a preset's default mappings. A control missing from a preset used to mean the diagnostic never asked about it at all. The function is pure, and `usePositionalOneByOne` only reads live state to detect which control fired. A button's position is its expectation: a joystick-level press landing anywhere else means the raw index disagrees with what SDL reports at that name.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/positional-capture/positional-capture.constants.ts

- `AXIS_FIRED_THRESHOLD` (0.5) is the minimum axis delta from the baseline that counts as moved, not resting jitter.
- `AXIS_TRAVEL_THRESHOLD` (0.8) is how far an axis must travel end to end before its identity is trusted. A full stick sweep or a trigger pressed to the stop clears it, a knock or a resting drift does not.
- `REST_EPSILON` (0.25): within this of the baseline counts as back at rest.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/positional-capture/positional-capture.type.ts

- A target is a fixed, ordered ask ("press A", "move the LEFT stick") built from SDL's own capability report for the connected device before any input arrives. A record is the outcome once the user answers it or skips it.
- The joystick-level index that fired is compared against the SDL position's own index, so a mismatch (something firing at a different raw index than the name SDL gave it) is visible in the recorded data.
- `expectedIndex` is the `SDL_BUTTON` index for a button target's own position, and null for an axis target, which has no comparable single index.
- `firedIndex` is the joystick-level button or axis index that fired, and `firedPositionalName` the positional name at that index (SOUTH, LEFT_TRIGGER, and so on). Both are null when skipped.
- `mismatch` is true only when `firedIndex` and `expectedIndex` are both known and disagree.
- `AxisRanges` is the per-axis travel seen so far while one target is being captured.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/positional-capture/usePositionalOneByOne.ts

- Drives the positional-capture step with the same one-by-one interaction `ButtonMapping` renders for byte capture (prompt, wait, record, advance, skip, go back), from joystick-level samples instead of raw byte diffs. The ask list comes from the device's resolved controls. `trimTargetsToDevice` is a safety net against the first live sample.
- The ask list is built once per device and stays stable while the step is active.
- When a new item becomes active the controller is usually still moving from the previous answer. Nothing is accepted until it has come back to rest, then the baseline is taken again from that resting position, so one stick sweep cannot answer every remaining item in a single frame.
- It reads the same decoded gamepad layer the calibration screen uses, so a recorded position means what its name says. The joystick layer underneath numbers its buttons and axes differently, and naming those numbers with positional names produced records that disagreed with the rest of the app.
- An axis is identified by how far it travels, not by the first frame it moves. The answer lands once the control returns to rest.

## apps/desktop/src/views/InputTester/sub-components/diagnostics-wizard/sub-components/

- `IntroStep` (step 1) explains the run and shuts SDL's gamepad backend down right there, before any device list is shown, so step 2 lists a controller only through the raw HID enumeration or the SDL snapshot taken just before the release. Next and Back stay disabled in the footer until its status line reaches done.
- `ChooseControllerStep` (step 2) lists every controller the run can find, the union of the raw HID enumeration and the pre-release SDL snapshot, and lets the user pick the one the later steps run against. Sourced this way, the list is never empty just because SDL's backend is released, and it still includes an XInput-style controller the HID enumeration alone never sees.
- `MatchedEntryPanel` shows what the real database knows about the selected device: SDL's own name, the gamecontrollerdb mapping line loaded for its guid (or none), which calibration profile the run uses, and whether a byte capture can run for it.
- `ByteCaptureStep` (step 3) releases the exclusive hold, then runs the byte-level capture body against the controller and profile chosen in step 2. The body is the `HidCalibrationWizard`, driven straight into live calibration through `initialProfileId` and `initialHasGyro` without its own picker, since step 2 resolved both. `initialProfile` is the layout read during the chooser step's SDL window, preferred over deriving one again, which cannot see a released device.
- `PositionalCaptureStep` (step 4) restores the exclusive hold, then asks for every control SDL reports the device has, one at a time in a fixed order, reusing the byte-capture step's one-by-one `ButtonMapping` UI through its `includeStickTriggerIds`, `showAxisSubStep` and `stepTitle` options. Each answer pairs what was asked for with the joystick-level index that fired, so a mismatch between what SDL calls a position and what physically fires there shows in the record.
- `SummaryStep` shows the byte-level capture and the positional capture side by side. The byte column explains itself when the controller has no byte capability and that step never ran. The step's actions live in the dialog's own footer, where every other step's Back and Next buttons live.
- `DiagnosticsStepActions` is the Back and Next pair for the four sub-steps whose navigation never differs by host: intro, choose-controller, byte-capture and positional-capture. The summary ends the run differently per host (restart and loop for the standalone dialog, hand off to the report's review step for the controller report) and is built by the caller. `introBack` is the one seam between hosts: the standalone dialog has no earlier step, so it leaves this unset and shows no Back on the intro. The controller report passes a callback that leaves the diagnostic run.
- `HoldStatusLine` is the status line for a hold release or restore: a spinner while the native call is in flight, then a settled state.
- `LayoutCaptureOverlay` covers the step while the controller's layout is being read. The read needs SDL brought up and taken down again, which takes long enough to notice, so each stage is named, and the fetch line names the pad being read.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/button-detection/

Button capture: press once and the wizard moves to the next prompt, the same feel as positional capture. There is no confirm-frame wait and no release wait, so one frame is enough. What keeps a lingering previous press out of this item's answer is a snapshot of what already differs from rest when the item becomes active (`heldAtActivationRef`); a press is a bit that arrives, not a moment when the whole report falls silent. Waiting for silence cannot work: reports with a counter or timestamp byte never go quiet, and the capture would hang with no explanation. The first frame after activation only records that snapshot, and logs what the item compares against: a capture that seems to do nothing almost always has no baseline, the input's byte excluded, or the byte written off as restless. When bytes change but every one is filtered, that is logged at most once a second.

Axis capture keeps the two-step flow: push to the positive extreme, then the negative one, each confirmed over `CONFIRM_FRAMES` and followed by a release. The axis byte is the one with the widest difference between the two extremes. Restless bytes are ignored here too, because the release step only completes on a frame with no differences left.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/ButtonMapping.tsx

Hosts can override the step title, include stick and trigger items (the positional-capture step has no separate stick and trigger cards), and hide the two-part axis hint (positional capture asks about an axis in one shot).

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/ByteChangeDot.tsx

How far a byte moved from its baseline, drawn on the top border of its cell. Not a fill, border or text colour: "changed" has to read on top of whatever state the cell already shows (picked, claimed, excluded), and it is what the exclude workflow is judged against. An axis byte grows from the centre toward the left for negative and the right for positive; a byte with no direction (a bitmask) grows both ways. Colour encodes magnitude, green through amber to red, with fixed data-viz hues. The width is floored so the smallest real change still shows. Only stick and trigger bytes are signed.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/FlakyByteWarningDialog.tsx

Every flagged byte starts checked, since excluding them all is the recommended action. The selection resets whenever a fresh check reopens the dialog. While open, each byte's live movement refreshes so the user sees whether it still misbehaves.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/InstructionsPanel.tsx

Open by default (still collapsible) because most calibration mistakes come from skipping it.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/LiveParserOutput.tsx

Shows what SDL3's own decoded state reports for the same live bytes the grid is diffing: ground truth from the transport. Every positional slot the device reports is shown, including ones with no default SNES mapping (Home, Capture, C, GL, anything past MISC1), under a neutral positional name.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/components/StickCard.tsx

A mapped stick is only done once it has also been read at rest, a separate deliberate step started by hand because only the user knows the stick is free.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/connection-hint.ts

SDL reports the transport directly on the controller-added event and in the device snapshot (`busType`), so the connection hint is ground truth, not a guess. The function keeps its historical name and one-argument shape because it is still the one place `calibrationMap.connectionHint` is resolved.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/diagnostics/

The gamepad diagnostics report: who the device is, what the input layer can say about it, and how it was identified. The wizard's byte capture and positional capture travel with the report as their own artefacts, each in its native shape, never flattened into the summary. Copy and save both report real success or failure. Two SDL3 captures run for the device: a raw HID byte capture (best effort, since SDL's own joystick handle can hold the device exclusively) and a joystick-level capture (needs an SDL joystick id, so only once SDL has claimed the device).

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/flaky-byte-detect/

Finds bytes still changing while nothing is touched, the most common cause of a bad button capture per the wizard's own instructions. It runs right before button capture so the user can exclude them up front (`apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useFlakyByteWarning.ts` turns the result into a dialog). It samples for `FLAKY_SAMPLE_MS`; a wobble below `FLAKY_MIN_RANGE` is ordinary ADC noise. Excluded bytes are skipped, since they are already out of the capture's way.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hid-analysis/

Byte-level analysis of raw HID reports. A changed byte is analog when it moved by at least `ANALOG_THRESHOLD_DELTA` and flipped more than three bits. A counter byte changes on more than 70 percent of reports, mostly by small steps (three or less, with wrap-around). When several bytes change at once, the likely answer is the digital change with the fewest bits, or failing that the analog byte that moved furthest from rest. An analog byte used as a button gets a threshold a third of the way from rest to pressed.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hid-calibration.type.ts

The HID calibration map. A button mapping is a byte and a bit mask; an analog trigger used as a button adds `threshold` (the value above which it counts as pressed) and `restValue` (the byte at rest). An axis mapping carries `idle` once the axis has been read at rest: `drift` is the widest excursion from centre seen while untouched, which is the floor any deadzone must clear. Without `idle`, rest was never measured.

`devicePath` is the raw OS device path (for example from node-hid enumeration). `rawManufacturer`, `rawProduct` and `serialNumber` are the device's own strings, distinct from `name`, which is this app's display name. `platform` uses the same label as the debug-info block. `appVersion` keeps captures from different versions of the wizard's heuristics apart. `guid` is SDL's joystick GUID, the key of a gamecontrollerdb line, so a report without it cannot become one. `sdlMapping` is SDL's own line for that GUID when it has one, `sdlType` is SDL's gamepad family (not a model name), `sdlHasButton` and `sdlHasAxis` are what SDL says the device has by positional index, and `sdlVersion` is the SDL version the capture ran against. A trigger kind is analog (a swept range), digital (a single bit) or unknown until the recording shows which (see `apps/desktop/src/views/InputTester/sub-components/hid-calibration/trigger-classify`).

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useCalibrationActions.ts

Button detection is a comparison against the resting report: `findButtonBits` walks the shorter of baseline and frame, so with no baseline it compares zero bytes and every press is silently dropped. Starting a capture therefore takes the baseline on demand. Clicking a byte cell is a two-state toggle whatever the byte was: the first click excludes it (clearing any stick, trigger or button claim so the exclusion shows), the next returns it to unregistered. It never cycles into a classification. The gyro step's exclusions are kept apart from `excludedRef` (`gyroExcludedBytesRef`) so a later stick capture can reconsider only what the gyro step flagged.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useCalibrationExport.ts

An axis item can carry either shape: a trigger that turned out to be a switch holds a bit mapping, not a range. The export reads the mapping, not the item kind; matching on kind once dropped those triggers from the report while the UI showed them captured. Identity and the SDL capability view come from the same captured entry, so a report always describes one observation.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useDeviceAutoDetect.ts

Builds the checklist the wizard calibrates against straight from SDL's live capability report (`hasButton`, `hasAxis`, `buttonLabels`); no per-model database is consulted. The manual override list is the small set of SDL gamepad families. A host that already read the layout hands it over, since by then the device is released and reports no capabilities. A host that resolved only an id gets the live profile when the device is claimed, and otherwise the family's full set. Auto-detect reads the live snapshot, so a connected device that has not sent a report yet (SDL emits state on change only) is still detected.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useDeviceRawInfo.ts

SDL's `busType` is ground truth for USB or Bluetooth. node-hid is gone, so path, manufacturer and serial have no source and stay null; the product name still comes through. Both this hook and `useWizardRawCapture` fall back to the first ready device in the live snapshot, not one that has reported input, so an untouched pad can still be picked.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useHidCalibration.ts

The core state machine of the HID calibration wizard. `setItems` updates `itemsRef` at call time, not inside the updater React runs later: everything in the wizard reads `itemsRef`, including the byte status computation finalisers call on the next line, so a late assignment left those reads one capture behind and a just-claimed byte kept the previous item's colour.

When a host already resolved the device and profile, the profile picker is skipped. `detectedProfile` resolves asynchronously, so the auto-confirm waits for it; firing on `selectedProfileId` alone would race into a null profile, permanently, since it only tries once. It runs as a layout effect so the picker never paints. Identity (vendor and product id) is filled from the chosen device as soon as it is known, not only from the devices that have reported: a device captured with SDL's hold released never appears there, which left the ids at 0 for the whole capture. The flaky-byte check gates the start of button capture without replacing the underlying action.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/hooks/useReportSubscription.ts

Two subscriptions while live: raw HID bytes (fanned out to gyro, stick, trigger and button processing) and the same input through the real shipped parser, for the live parser panel beside the byte grid. Restlessness is observed on every frame, whatever step runs, so it is known before the first capture. The report names its own device, so identity comes from it. An idle reading runs after a stick is mapped, so it takes frames ahead of every capture branch.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/noisy-bytes/

Which byte positions keep moving on their own. A pad with motion sensors or analog sticks reports bytes that never hold still. The difference from a pressed input is frequency, not amount: a held button changes its byte once going down and once coming up, while a motion or analog byte changes on nearly every frame. Per byte, it counts how often the value differs from the previous frame over a window of about a second (`WINDOW_FRAMES`) and reports the ones that move in more than a quarter of it. This is kept apart from the excluded set and from byte statuses: a restless byte is not claimed for a stick and never recolours a cell; it is only ignored for detection.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/report-processing/

The trigger candidate floor is a range of 2, not 15: a switch reported as one bit moves its byte by only that bit's value, and the low bits count as much as the high ones. Which kind it is gets decided by classification, never by width. The trigger's kind is part of the stability key, since a byte that keeps changing its mind about what it is has not settled.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/stick-center/

Records what a stick's bytes do while nobody touches it. Rest is not a single number: a real stick drifts, so the reading keeps the median and the extremes over a fixed stretch (`IDLE_SAMPLE_MS`) and never waits for the values to stop changing, which on a drifting stick never happens. The user starts it, because only they know when the stick is free; inferring it once produced a centre taken while the stick was still held. A byte that never repeats is not an axis at rest, it is a counter.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/stick-gyro-reclaim/

When a stick capture finds no sensible pair after `GYRO_RECLAIM_DELAY_MS`, it reconsiders the bytes the gyro step excluded (and only those: never a byte a stick or trigger step has since claimed). A real sweep makes a large coherent range, while gyro and accelerometer noise from waving the pad stays small, so a range of at least `GYRO_RECLAIM_MIN_RANGE` qualifies. At most a pair is reclaimed, once per capture, and each reclaim is logged.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/stick-trigger-handlers/

A trigger that is a switch is recorded the way a button is, and its byte is not excluded or claimed: other bits in it belong to real buttons, and taking the whole byte would make them unmappable. The stick finaliser logs the two item ids it wrote, because the card decides it is done by finding those ids in its own list; when a capture seems to reset, that line shows whether the write landed.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/trigger-classify/

Whether a trigger is an axis or a switch has to be measured: both exist across pads. Range alone cannot tell them apart, because a switch reported as one bit of a shared button byte moves that byte by the bit's own value, so a high bit looks as wide as an analog sweep. What separates them is how many distinct values the byte takes while worked: an analog trigger passes through a continuum, a switch only reads pressed or released and differs from rest by a single bit. Every value seen must differ from rest by the same single bit for a switch; other bits of a shared byte belong to other buttons. Four distinct values or fewer cannot be a sweep; eight or more cannot be a switch; in between the answer stays unknown and sampling continues.

## apps/desktop/src/views/InputTester/sub-components/hid-calibration/wizard-helpers.ts

Holds only `getByteColor`. The file keeps this name because `eslint.config.mjs` lists this exact path among the raw-colour exceptions (categorical colours that encode byte roles). Renaming it needs that exception moved first.

## apps/desktop/src/views/InputTester/sub-components/HidCalibrationWizard.tsx

- Byte-level HID calibration. The flow: profile, GYRO (manual start and stop), IDLE (a one-click baseline), STICKS (a full circle auto-detects the 2 widest-range bytes), BUTTONS (auto-detect on bytes that are not excluded).
- The device and layout are settled before the wizard mounts. The `select-profile` early return covers the one frame before the layout arrives.
- A controller held exclusively at a lower level has no raw HID bytes. The wizard still runs on gamepad and joystick data, so it shows a notice in place of an empty byte grid.

## apps/desktop/src/views/InputTester/sub-components/HidCalibrationWizard.type.ts

- `hideOwnActions` suppresses the wizard's own Copy, Finish and Cancel row for a host that renders its own through `HidWizardHandle`.
- `onCapturedCountChange` fires whenever the captured count changes, so such a host can drive its own Finish button.
- `initialProfile` is a layout already read from the live device and is used as is, because a released device can no longer be asked. `capturedEntry` is the device entry it was read from, for the report's identity fields.
- `initialProfileId` skips the profile picker and starts live calibration against that profile. `initialHasGyro` goes with it and is ignored when `initialProfileId` is unset.
- `HidWizardHandle` is the imperative surface for a `hideOwnActions` host. `copyJson` resolves true on success and false on failure, for example a denied clipboard write.

## apps/desktop/src/views/InputTester/sub-components/InputCalibration.tsx

The Controller Diagnostics page: the game's own tools on top of the Brock input module. The generic tester (live state, stick and trigger calibration, rumble tests, mapping lines) is the module's Controllers screen. This page keeps the gamepad diagnostics wizard (with the byte-level HID calibration wizard inside it), the controller report dialog, the family view of each pad, the game rumble preview and the diagnostics log.

## apps/desktop/src/views/InputTester/sub-components/RumbleStrengthControl.tsx

A per-device rumble multiplier on top of the family strength curve in `packages/input-mapping/src/family/vibration-shaping.ts`. It is neutral at 1 and persisted per device key.

## apps/desktop/src/views/InputTester/sub-components/useInputCalibration.ts

- The state for the Controller Diagnostics page. Connect and disconnect events for the log come from `inputApi()` (`onAdded`, `onRemoved`).
- The definitive "is a controller connected" answer is the module's device snapshot with status `ready`. The input store's own tally counts only devices that have sent at least one input report, so an untouched pad already visible as a card would read as disconnected there.
- It subscribes to the input manager for all input state and to a lightweight HID diagnostics listener with no input polling. The log scrolls itself to the newest entry.
