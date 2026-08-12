/* @layer renderer-components @kind component */
/**
 * Sticks + triggers calibration cards, shown once the gyro/idle prereqs are
 * done. Split out of HidCalibrationWizard.tsx for file-size compliance.
 * Takes the whole wizard state bag since it is purely a wiring layer between
 * useHidCalibration and StickCards/TriggerCards.
 */
import type { useHidCalibration } from '../hooks';
import { StickCards } from './StickCards';
import { TriggerCards } from './TriggerCards';

interface StickTriggerSectionProps {
  wiz: ReturnType<typeof useHidCalibration>;
}

const StickTriggerSection = (props: StickTriggerSectionProps) => {
  const { wiz } = props;
  if (!wiz.prereqsDone) return null;
  return (
    <>
      <StickCards
        items={wiz.items}
        activeStick={wiz.activeStick}
        stickBusy={wiz.stickBusy}
        stickLiveInfo={wiz.stickLiveInfo}
        stickPickMode={wiz.stickPickMode}
        stickPickedBytes={wiz.stickPickedBytes}
        onStartCircle={wiz.handleStartCircle}
        onStopCircle={wiz.handleStopCircle}
        onSkipStick={wiz.handleSkipStick}
        onStickRedo={wiz.handleStickRedo}
        onStickIdle={wiz.handleStickIdle}
        onStickPickMode={wiz.handleStickPickMode}
        onConfirmPick={wiz.handleConfirmPick}
        onCancelPick={wiz.handleCancelPick}
      />
      <TriggerCards
        items={wiz.items}
        activeTrigger={wiz.activeTrigger}
        triggerBusy={wiz.triggerBusy}
        triggerLiveInfo={wiz.triggerLiveInfo}
        triggerPickMode={wiz.triggerPickMode}
        triggerPickedByte={wiz.triggerPickedByte}
        idleRecording={wiz.idleRecording}
        idleResults={wiz.idleResults}
        onStartTrigger={wiz.handleStartTrigger}
        onStopTrigger={wiz.handleStopTrigger}
        onSkipTrigger={wiz.handleSkipTrigger}
        onTriggerRedo={wiz.handleTriggerRedo}
        onTriggerPickMode={wiz.handleTriggerPickMode}
        onConfirmTriggerPick={wiz.handleConfirmTriggerPick}
        onCancelTriggerPick={wiz.handleCancelTriggerPick}
        onIdleRecord={wiz.handleIdleRecord}
      />
    </>
  );
};

export { StickTriggerSection };
