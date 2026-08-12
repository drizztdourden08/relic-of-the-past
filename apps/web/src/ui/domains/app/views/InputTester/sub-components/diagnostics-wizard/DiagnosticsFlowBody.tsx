/* @layer renderer-components @kind component */
/**
 * The content for whichever of the five diagnostic sub-steps is active,
 * plus the layout-capture overlay that can cover any of them. Shared by the
 * standalone diagnostics dialog and the controller report's embedded run,
 * so the two hosts render the exact same step components rather than each
 * keeping their own copy of this switch.
 */
import type { RefObject } from 'react';
import { Box } from '@ds/primitives';
import type { HidWizardHandle } from '../HidCalibrationWizard';
import type { DiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';
import { IntroStep } from './sub-components/IntroStep';
import { ChooseControllerStep } from './sub-components/ChooseControllerStep';
import { ByteCaptureStep } from './sub-components/ByteCaptureStep';
import { PositionalCaptureStep } from './sub-components/PositionalCaptureStep';
import { SummaryStep } from './sub-components/SummaryStep';
import { LayoutCaptureOverlay } from './sub-components/LayoutCaptureOverlay';

interface DiagnosticsFlowBodyProps {
  wizard: DiagnosticsWizardState;
  wizardRef: RefObject<HidWizardHandle | null>;
  onCapturedCountChange: (count: number) => void;
}

const DiagnosticsFlowBody = (props: DiagnosticsFlowBodyProps) => {
  const { wizard, wizardRef, onCapturedCountChange } = props;

  return (
    <Box className="diagnostics-wizard__body">
      <LayoutCaptureOverlay
        stage={wizard.layoutStage}
        deviceName={wizard.capturedLayout?.resolved.name ?? wizard.selectedChooser?.name ?? wizard.selectedChooser?.product ?? 'controller'}
      />
      {wizard.step === 'intro' && <IntroStep releaseStatus={wizard.releaseStatus} />}
      {wizard.step === 'choose-controller' && (
        <ChooseControllerStep
          devices={wizard.chooserDevices}
          addedNames={wizard.addedNames}
          selectedDeviceKey={wizard.deviceKey}
          onSelect={wizard.setDeviceKey}
          selectedEntry={wizard.selectedChooser}
          mapping={wizard.mapping}
          profile={wizard.profile}
        />
      )}
      {wizard.step === 'byte-capture' && (
        <ByteCaptureStep
          ref={wizardRef}
          releaseStatus={wizard.releaseStatus}
          deviceKey={wizard.deviceKey}
          initialProfile={wizard.capturedProfile}
          capturedEntry={wizard.capturedLayout?.entry}
          initialProfileId={wizard.capturedProfile?.id ?? wizard.profile?.id}
          initialHasGyro={wizard.hasGyro}
          onCapturedCountChange={onCapturedCountChange}
          onComplete={wizard.handleByteCaptureComplete}
          onCancel={wizard.goBack}
        />
      )}
      {wizard.step === 'positional-capture' && (
        <PositionalCaptureStep
          restoreStatus={wizard.restoreStatus}
          deviceKey={wizard.deviceKey}
          resolvedDevice={wizard.resolvedDevice}
          onRecordsChange={wizard.handleRecordsChange}
        />
      )}
      {wizard.step === 'summary' && (
        <SummaryStep
          byteCapture={wizard.byteCapture}
          hasByteCapability={wizard.hasByteCapability}
          positionalRecords={wizard.positionalRecords}
        />
      )}
    </Box>
  );
};

export { DiagnosticsFlowBody };
export type { DiagnosticsFlowBodyProps };
