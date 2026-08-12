/* @layer renderer-components @kind component */
/**
 * Step 3: releases the exclusive hold, then runs the byte-level capture body
 * against the controller and profile chosen in step 2. The capture body is
 * the restored HidCalibrationWizard components, driven straight into live
 * calibration via initialProfileId/initialHasGyro rather than through its
 * own picker screen, since step 2 already resolved both.
 */
import { forwardRef } from 'react';
import { HidCalibrationWizard } from '../../HidCalibrationWizard';
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@shared/ipc';
import type { HidControllerMap, HidWizardHandle } from '../../HidCalibrationWizard';
import type { HoldTransitionStatus } from '../behavior/useHoldTransition';
import { HoldStatusLine } from './HoldStatusLine';

interface ByteCaptureStepProps {
  releaseStatus: HoldTransitionStatus;
  deviceKey: string | null;
  /** The layout read during the chooser step's SDL window, when there is one.
   *  Preferred over re-deriving, which cannot see a released device. */
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro: boolean;
  onCapturedCountChange: (count: number) => void;
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
}

const ByteCaptureStep = forwardRef<HidWizardHandle, ByteCaptureStepProps>((props, ref) => {
  const { releaseStatus, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro, onCapturedCountChange, onComplete, onCancel } = props;

  return (
    <>
      <HoldStatusLine
        status={releaseStatus}
        pendingText="Releasing the hold on every controller…"
        doneText="The hold on this controller is dropped for the capture below."
        errorText="Couldn't release the hold. The capture below may stay empty."
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
export type { ByteCaptureStepProps };
