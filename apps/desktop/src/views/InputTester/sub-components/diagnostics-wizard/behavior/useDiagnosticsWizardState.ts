/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { DiagnosticsWizardState, UseDiagnosticsWizardStateProps, WizardStep } from '../diagnostics-wizard.type';
import { useAddedDeviceNames } from './useAddedDeviceNames';
import { selectedChooserFacts } from './selected-chooser-facts';
import { useCaptureResults } from './useCaptureResults';
import { useDeviceEntry } from './useDeviceEntry';
import { useDeviceMapping } from './useDeviceMapping';
import { useHoldTransition } from './useHoldTransition';
import { useLayoutCapture } from './useLayoutCapture';
import { useHidListedDevices } from './useHidListedDevices';
import { restoreHold } from './restore-hold';
import { useStep1Shutdown } from './useStep1Shutdown';
import { buildChooserDevices } from './chooser-devices';
import { useChooserSelection } from './useChooserSelection';
import { useRestoreHoldOnClose } from './useRestoreHoldOnClose';
import { useWizardNavigation } from './useWizardNavigation';
import { useWizardProfiles } from './useWizardProfiles';

const useDiagnosticsWizardState = (props: UseDiagnosticsWizardStateProps) => {
  const { open, onComplete, initialDeviceKey } = props;
  const [step, setStep] = useState<WizardStep>('intro');
  const [runGeneration, setRunGeneration] = useState(0);
  const results = useCaptureResults(onComplete);
  const { clearResults } = results;

  const { preReleaseReady, releaseStatus } = useStep1Shutdown(open, runGeneration);
  const hidListed = useHidListedDevices(open);
  const chooserDevices = useMemo(() => buildChooserDevices(hidListed, preReleaseReady), [hidListed, preReleaseReady]);

  const layoutCapture = useLayoutCapture();
  const addedNames = useAddedDeviceNames();
  const { deviceKey, setDeviceKey, selectedChooser } = useChooserSelection({ open, step, chooserDevices, initialDeviceKey });
  const liveDeviceEntry = useDeviceEntry(deviceKey);
  const facts = selectedChooserFacts(selectedChooser);
  const { hasByteCapability } = facts;
  const liveMapping = useDeviceMapping(facts.guid);
  const mapping = facts.mapping ?? liveMapping;

  const restoreTransition = useHoldTransition(restoreHold, open && step === 'positional-capture');
  useRestoreHoldOnClose(open, restoreTransition.status);

  const activeSdlId = liveDeviceEntry?.sdlId ?? facts.sdlId ?? null;
  const { resolvedDevice, profile, capturedProfile } = useWizardProfiles({
    selectedChooser, liveDeviceEntry, capturedLayout: layoutCapture.layout,
  });

  const { stepIndex, stepLabels, goNext, goBack } = useWizardNavigation({ hasByteCapability, step, setStep });

  const confirmChoice = useCallback(async () => {
    if (!deviceKey) return;
    const captured = await layoutCapture.capture(deviceKey);
    if (captured) goNext();
  }, [deviceKey, layoutCapture, goNext]);

  const restart = useCallback(() => {
    setStep('intro');
    clearResults();
    setDeviceKey(null);
    layoutCapture.reset();
    void restoreHold()
      .catch(() => undefined)
      .finally(() => setRunGeneration((g) => g + 1));
  }, [layoutCapture, setDeviceKey, clearResults]);

  return {
    step, stepIndex, stepLabels,
    deviceKey, setDeviceKey, chooserDevices, addedNames, selectedChooser, mapping, profile, resolvedDevice, hasByteCapability,
    hasGyro: facts.hasGyro, vendorIdHex: facts.vendorIdHex, productIdHex: facts.productIdHex,
    releaseStatus, restoreStatus: restoreTransition.status, activeSdlId,
    byteCapture: results.byteCapture, handleByteCaptureComplete: results.handleByteCaptureComplete,
    positionalRecords: results.positionalRecords, handleRecordsChange: results.handleRecordsChange,
    goNext, goBack, restart, finishAndClose: results.finishAndClose,
    confirmChoice, layoutStage: layoutCapture.stage, capturedLayout: layoutCapture.layout, capturedProfile,
  };
};

export { useDiagnosticsWizardState };
export type { DiagnosticsWizardState };
