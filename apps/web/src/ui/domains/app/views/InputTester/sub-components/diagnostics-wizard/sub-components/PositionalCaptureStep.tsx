/* @layer renderer-components @kind component */
/**
 * Step 4: restores the exclusive hold, then asks the user for every control
 * SDL itself reports the device has, ONE AT A TIME in a fixed order, reusing
 * the byte-capture step's one-by-one ButtonMapping UI (see
 * ButtonMapping.tsx's includeStickTriggerIds/showAxisSubStep/stepTitle
 * extensions). Each answer pairs what was asked for against the joystick-
 * level index that actually fired, so a mismatch between what SDL calls a
 * position and what physically fires there is visible in the record instead
 * of silently invisible.
 */
import { useEffect } from 'react';
import { Text } from '@ds/primitives';
import type { ResolvedDevice } from '@shared/input/family';
import { ButtonMapping } from '../../hid-calibration/components';
import type { HoldTransitionStatus } from '../behavior/useHoldTransition';
import { usePositionalOneByOne } from '../positional-capture/usePositionalOneByOne';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';
import { HoldStatusLine } from './HoldStatusLine';

interface PositionalCaptureStepProps {
  restoreStatus: HoldTransitionStatus;
  deviceKey: string | null;
  resolvedDevice: ResolvedDevice | null;
  onRecordsChange: (records: PositionalCaptureRecord[]) => void;
}

const PositionalCaptureStep = (props: PositionalCaptureStepProps) => {
  const { restoreStatus, deviceKey, resolvedDevice, onRecordsChange } = props;
  const active = restoreStatus === 'done';
  const capture = usePositionalOneByOne({ deviceKey, active, resolvedDevice });

  useEffect(() => { onRecordsChange(capture.records); }, [capture.records, onRecordsChange]);

  return (
    <>
      <HoldStatusLine
        status={restoreStatus}
        pendingText="Restoring the hold on every controller…"
        doneText="The hold is back. This controller reads normally again."
        errorText="Couldn't restore the hold. The capture below may not receive anything."
      />

      {active && deviceKey === null && (
        <Text as="p" className="diagnostics-wizard__pos-warning">
          No device selected for this capture. Go back and pick one.
        </Text>
      )}

      {active && deviceKey !== null && (
        <>
          <Text as="p">
            Each input below is asked for by name, one at a time, using the controller's own
            labels. Provide it on the controller and this records which physical position
            actually fired.
          </Text>
          <ButtonMapping
            items={capture.items}
            buttonItems={capture.items}
            buttonCapturedCount={capture.capturedCount}
            activeIndex={capture.activeIndex}
            inputPhaseActive={capture.inputPhaseActive}
            autoAdvance={capture.autoAdvance}
            captureState="waiting-press"
            axisSubStep="pos"
            instruction={capture.instruction}
            prereqsDone
            includeStickTriggerIds
            showAxisSubStep={false}
            stepTitle={`Positional capture (${capture.capturedCount}/${capture.items.length})`}
            onStartButtons={capture.onStartButtons}
            onSkip={capture.onSkip}
            onGoBack={capture.onGoBack}
            onClickItem={capture.onClickItem}
            onClearItem={capture.onClearItem}
            setAutoAdvanceWrapped={capture.setAutoAdvanceWrapped}
            setInputPhaseActiveWrapped={capture.setInputPhaseActiveWrapped}
          />
        </>
      )}
    </>
  );
};

export { PositionalCaptureStep };
export type { PositionalCaptureStepProps };
