/* @layer renderer-components @kind component */
import type { DiagnosticsFlowBodyProps } from '../diagnostics-wizard.type';
import { ByteCaptureStep } from './ByteCaptureStep';

const ByteCaptureFlow = (props: DiagnosticsFlowBodyProps) => {
  const { wizard, wizardRef, onCapturedCountChange } = props;

  return (
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
  );
};

export { ByteCaptureFlow };
