/* @layer renderer-components @kind hook */
/**
 * Central state machine for the diagnostics wizard dialog: which step is
 * active (byte capture skipped entirely for a controller with no byte
 * capability, see wizard-steps.ts), which device it runs against (the union
 * of chooser-devices.ts), the hold release/restore transitions steps 1 and 4
 * gate on, and the two capture results the final step shows side by side.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { restoreHold } from '@app/lib/input/controller-hold-store';
import type { DeviceProfile } from '@shared/input';
import { resolveDeviceFromEntry } from '@app/lib/input/resolve-device';
import type { ResolvedDevice } from '@shared/input/family';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';
import { useAddedDeviceNames } from './useAddedDeviceNames';
import { buildProfileFromResolved, toHex4 } from './build-chooser-profile';
import { useDeviceEntry } from './useDeviceEntry';
import { useDeviceMapping } from './useDeviceMapping';
import { useHoldTransition } from './useHoldTransition';
import { useLayoutCapture } from './useLayoutCapture';
import { useHidListedDevices } from './useHidListedDevices';
import { useStep1Shutdown } from './useStep1Shutdown';
import { buildChooserDevices } from './chooser-devices';
import type { ChooserDevice } from './chooser-devices';
import { useWizardNavigation } from './useWizardNavigation';
import type { WizardStep } from './wizard-steps';

interface UseDiagnosticsWizardStateProps {
  open: boolean;
  onComplete?: (map: HidControllerMap) => void;
  /** Preferred device to preselect once the chooser list is available, for a
   *  host (the controller report) that already knows which device it is
   *  about. Falls back to the first listed device when unset, absent, or no
   *  longer present, exactly like the standalone dialog always has. */
  initialDeviceKey?: string | null;
}

const useDiagnosticsWizardState = (props: UseDiagnosticsWizardStateProps) => {
  const { open, onComplete, initialDeviceKey } = props;
  const [step, setStep] = useState<WizardStep>('intro');
  const [deviceKey, setDeviceKey] = useState<string | null>(null);
  const [byteCapture, setByteCapture] = useState<HidControllerMap | null>(null);
  const [positionalRecords, setPositionalRecords] = useState<PositionalCaptureRecord[]>([]);
  const [runGeneration, setRunGeneration] = useState(0);

  // Fires once per dialog open (and again per "Restart on another controller"
  // via runGeneration), not once per visit to step 1: going Back from step 2
  // to step 1 and forward again must not re-run this and clobber the frozen
  // pre-release snapshot with an already-released (empty-looking) one.
  const { preReleaseReady, releaseStatus } = useStep1Shutdown(open, runGeneration);
  const hidListed = useHidListedDevices(open);
  const chooserDevices = useMemo(() => buildChooserDevices(hidListed, preReleaseReady), [hidListed, preReleaseReady]);

  const layoutCapture = useLayoutCapture();
  const addedNames = useAddedDeviceNames();
  const liveDeviceEntry = useDeviceEntry(deviceKey);

  const selectedChooser: ChooserDevice | null = useMemo(
    () => chooserDevices.find((d) => d.deviceKey === deviceKey) ?? null,
    [chooserDevices, deviceKey],
  );
  const hasByteCapability = selectedChooser?.hasByteCapability ?? true;
  const liveMapping = useDeviceMapping(selectedChooser?.guid);
  // The captured line wins: it was read while the subsystem was still up.
  const mapping = selectedChooser?.mapping ?? liveMapping;

  // Only steps 1-2 auto-pick a device: once the user has moved past step 2, a
  // device's chooser entry changing (the hold releasing/restoring) must not
  // null the selection back out from under the running capture.
  useEffect(() => {
    if (!open || (step !== 'intro' && step !== 'choose-controller')) return;
    if (deviceKey && chooserDevices.some((d) => d.deviceKey === deviceKey)) return;
    const preferred = initialDeviceKey && chooserDevices.some((d) => d.deviceKey === initialDeviceKey)
      ? initialDeviceKey
      : chooserDevices[0]?.deviceKey ?? null;
    setDeviceKey(preferred);
  }, [open, step, chooserDevices, deviceKey, initialDeviceKey]);

  const restoreTransition = useHoldTransition(restoreHold, open && step === 'positional-capture');

  // The sdlId to open a positional capture on: prefer the live entry (the
  // real one SDL just reassigned on restore) and fall back to the frozen
  // chooser entry only until that live re-resolution catches up.
  const activeSdlId = liveDeviceEntry?.sdlId ?? selectedChooser?.sdlId ?? null;

  // What step 4 asks about: SDL's own capability report for the live,
  // restored device, resolved through the family layer exactly like the
  // calibration cards. Only available once the live entry has re-resolved
  // after the restore (see activeSdlId above); null until then, which
  // usePositionalOneByOne treats as "nothing to ask yet".
  const resolvedDevice: ResolvedDevice | null = useMemo(
    () => (liveDeviceEntry ? resolveDeviceFromEntry(liveDeviceEntry) : null),
    [liveDeviceEntry],
  );

  // The calibration profile view for step 2's summary panel, built from the
  // same resolvedDevice, never a per-model database. Null until SDL's live
  // capability report for this device has resolved (see resolvedDevice above).
  const profile: DeviceProfile | null = useMemo(() => {
    if (!selectedChooser || !resolvedDevice) return null;
    return buildProfileFromResolved(resolvedDevice, selectedChooser.vendorId, selectedChooser.productId);
  }, [selectedChooser, resolvedDevice]);

  // What every step after the chooser asks about: the layout read during that
  // one deliberate SDL window (see useLayoutCapture). Frozen on purpose, since
  // nothing can be asked again until the subsystem comes back at the end.
  const capturedProfile: DeviceProfile | null = useMemo(() => {
    const captured = layoutCapture.layout;
    if (!captured) return null;
    return buildProfileFromResolved(captured.resolved, captured.entry.vendorId, captured.entry.productId);
  }, [layoutCapture.layout]);

  // Safety net: if the dialog is closed before step 4 ever restores the hold
  // (cancelled mid-way through steps 2/3), put the hold back anyway so every
  // other controller consumer in the app keeps working afterward.
  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (wasOpenRef.current && !open && restoreTransition.status !== 'done') {
      restoreHold().catch(() => {});
    }
    wasOpenRef.current = open;
  }, [open, restoreTransition.status]);

  const { stepIndex, stepLabels, goNext, goBack } = useWizardNavigation({ hasByteCapability, step, setStep });

  /**
   * Leaving the chooser reads the selected controller's real layout first, and
   * only advances once it has one. Everything after this point runs with SDL
   * down, so this is the last moment anything can ask the device what buttons
   * and axes it actually has, or what it is called.
   */
  const confirmChoice = useCallback(async () => {
    if (!deviceKey) return;
    const captured = await layoutCapture.capture(deviceKey);
    if (captured) goNext();
  }, [deviceKey, layoutCapture, goNext]);

  const restart = useCallback(() => {
    setStep('intro');
    setByteCapture(null);
    setPositionalRecords([]);
    setDeviceKey(null);
    layoutCapture.reset();
    // Put the hold back before the next run starts. Step 1 snapshots the
    // claimed devices first and can only see what is currently claimed, so
    // restarting while still released would list nothing and silently drop
    // every capability flag that only a claimed device carries.
    void restoreHold()
      .catch(() => { /* step 1 reports its own failure */ })
      .finally(() => setRunGeneration((g) => g + 1));
  }, [layoutCapture]);

  const handleByteCaptureComplete = useCallback((map: HidControllerMap) => {
    setByteCapture(map);
  }, []);

  const handleRecordsChange = useCallback((records: PositionalCaptureRecord[]) => {
    setPositionalRecords(records);
  }, []);

  const finishAndClose = useCallback((onClose: () => void) => {
    if (byteCapture) onComplete?.(byteCapture);
    onClose();
  }, [byteCapture, onComplete]);

  return {
    step, stepIndex, stepLabels,
    deviceKey, setDeviceKey, chooserDevices, addedNames, selectedChooser, mapping, profile, resolvedDevice, hasByteCapability,
    hasGyro: selectedChooser?.hasGyro ?? false,
    vendorIdHex: selectedChooser ? toHex4(selectedChooser.vendorId) : null,
    productIdHex: selectedChooser ? toHex4(selectedChooser.productId) : null,
    releaseStatus, restoreStatus: restoreTransition.status, activeSdlId,
    byteCapture, handleByteCaptureComplete,
    positionalRecords, handleRecordsChange,
    goNext, goBack, restart, finishAndClose,
    confirmChoice, layoutStage: layoutCapture.stage, capturedLayout: layoutCapture.layout, capturedProfile,
  };
};

/** The hook's return shape, threaded through the components both the
 *  standalone dialog and the controller report's embedded run share, so
 *  neither has to restate this dialog-agnostic contract. */
type DiagnosticsWizardState = ReturnType<typeof useDiagnosticsWizardState>;

export { useDiagnosticsWizardState };
export type { DiagnosticsWizardState };
