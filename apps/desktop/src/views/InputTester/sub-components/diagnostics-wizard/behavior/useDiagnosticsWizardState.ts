/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeviceProfile, ResolvedDevice } from '@rotp/input-mapping';
import { resolveDeviceFromEntry } from '@rotp/input-mapping';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';
import type {
  ChooserDevice, DiagnosticsWizardState, UseDiagnosticsWizardStateProps, WizardStep,
} from '../diagnostics-wizard.type';
import { useAddedDeviceNames } from './useAddedDeviceNames';
import { buildProfileFromResolved } from './build-chooser-profile';
import { toHex4 } from './to-hex4';
import { useDeviceEntry } from './useDeviceEntry';
import { useDeviceMapping } from './useDeviceMapping';
import { useHoldTransition } from './useHoldTransition';
import { useLayoutCapture } from './useLayoutCapture';
import { useHidListedDevices } from './useHidListedDevices';
import { restoreHold } from './restore-hold';
import { useStep1Shutdown } from './useStep1Shutdown';
import { buildChooserDevices } from './chooser-devices';
import { useWizardNavigation } from './useWizardNavigation';

const useDiagnosticsWizardState = (props: UseDiagnosticsWizardStateProps) => {
  const { open, onComplete, initialDeviceKey } = props;
  const [step, setStep] = useState<WizardStep>('intro');
  const [deviceKey, setDeviceKey] = useState<string | null>(null);
  const [byteCapture, setByteCapture] = useState<HidControllerMap | null>(null);
  const [positionalRecords, setPositionalRecords] = useState<PositionalCaptureRecord[]>([]);
  const [runGeneration, setRunGeneration] = useState(0);

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
  const mapping = selectedChooser?.mapping ?? liveMapping;

  useEffect(() => {
    if (!open || (step !== 'intro' && step !== 'choose-controller')) return;
    if (deviceKey && chooserDevices.some((d) => d.deviceKey === deviceKey)) return;
    const preferred = initialDeviceKey && chooserDevices.some((d) => d.deviceKey === initialDeviceKey)
      ? initialDeviceKey
      : chooserDevices[0]?.deviceKey ?? null;
    setDeviceKey(preferred);
  }, [open, step, chooserDevices, deviceKey, initialDeviceKey]);

  const restoreTransition = useHoldTransition(restoreHold, open && step === 'positional-capture');

  const activeSdlId = liveDeviceEntry?.sdlId ?? selectedChooser?.sdlId ?? null;

  const resolvedDevice: ResolvedDevice | null = useMemo(
    () => (liveDeviceEntry ? resolveDeviceFromEntry(liveDeviceEntry) : null),
    [liveDeviceEntry],
  );

  const profile: DeviceProfile | null = useMemo(() => {
    if (!selectedChooser || !resolvedDevice) return null;
    return buildProfileFromResolved(resolvedDevice, selectedChooser.vendorId, selectedChooser.productId);
  }, [selectedChooser, resolvedDevice]);

  const capturedProfile: DeviceProfile | null = useMemo(() => {
    const captured = layoutCapture.layout;
    if (!captured) return null;
    return buildProfileFromResolved(captured.resolved, captured.entry.vendorId, captured.entry.productId);
  }, [layoutCapture.layout]);

  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (wasOpenRef.current && !open && restoreTransition.status !== 'done') {
      restoreHold().catch(() => {});
    }
    wasOpenRef.current = open;
  }, [open, restoreTransition.status]);

  const { stepIndex, stepLabels, goNext, goBack } = useWizardNavigation({ hasByteCapability, step, setStep });

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
    void restoreHold()
      .catch(() => undefined)
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

export { useDiagnosticsWizardState };
export type { DiagnosticsWizardState };
