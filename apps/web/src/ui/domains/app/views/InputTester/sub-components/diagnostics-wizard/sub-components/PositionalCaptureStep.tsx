/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Text } from '@ds/primitives';
import { ButtonMapping } from '../../hid-calibration/components';
import { usePositionalOneByOne } from '../positional-capture/usePositionalOneByOne';
import type { PositionalCaptureStepProps } from './diagnostics-steps.type';
import { HoldStatusLine } from './HoldStatusLine';

const PositionalCaptureStep = (props: PositionalCaptureStepProps) => {
  const { restoreStatus, deviceKey, resolvedDevice, onRecordsChange } = props;
  const active = restoreStatus === 'done';
  const capture = usePositionalOneByOne({ deviceKey, active, resolvedDevice });

  useEffect(() => { onRecordsChange(capture.records); }, [capture.records, onRecordsChange]);

  return (
    <>
      <HoldStatusLine
        status={restoreStatus}
        pendingText="Restoring the hold on every controller..."
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
