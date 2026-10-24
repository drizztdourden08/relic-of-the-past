/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import { HidCalibrationWizard } from '../../HidCalibrationWizard';
import type { HidWizardHandle } from '../../HidCalibrationWizard';
import type { ByteCaptureStepProps } from './diagnostics-steps.type';
import { HoldStatusLine } from './HoldStatusLine';

const ByteCaptureStep = forwardRef<HidWizardHandle, ByteCaptureStepProps>((props, ref) => {
  const { releaseStatus, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro, onCapturedCountChange, onComplete, onCancel } = props;

  return (
    <>
      <HoldStatusLine
        status={releaseStatus}
        pendingText="Releasing the controller..."
        doneText="Controller released."
        errorText="Could not release the controller. The capture may stay empty."
      />
      {releaseStatus === 'done' && (
        <HidCalibrationWizard
          ref={ref}
          deviceKey={deviceKey ?? undefined}
          initialProfile={initialProfile}
          capturedEntry={capturedEntry}
          initialProfileId={initialProfileId}
          initialHasGyro={initialHasGyro}
          hideOwnActions
          onCapturedCountChange={onCapturedCountChange}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      )}
    </>
  );
});

ByteCaptureStep.displayName = 'ByteCaptureStep';

export { ByteCaptureStep };
