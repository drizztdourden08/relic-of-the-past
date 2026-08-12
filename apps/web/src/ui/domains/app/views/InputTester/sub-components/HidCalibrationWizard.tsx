/* @layer renderer-components @kind data */
/**
 * HID Calibration Wizard v6 — enhanced byte-level visualization.
 *
 * Flow:
 *  1. Select profile → immediately opens live view
 *  2. GYRO: manual toggle — user clicks Start, moves controller, clicks Stop.
 *  3. IDLE: one-click snapshot captures baseline state.
 *  4. STICKS: rotate each stick in full circle → auto-detect 2 bytes with largest range.
 *  5. BUTTONS: auto-detect presses using only non-excluded bytes.
 */
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import type { HidAxisMapping, HidButtonMapping, HidControllerMap } from './hid-calibration/hid-calibration.type';
import { useHidCalibration } from './hid-calibration/hooks';
import { useFlashStatus } from './hid-calibration/hooks/useFlashStatus';
import {
  InstructionsPanel, LiveParserOutput, PrereqCards, StickTriggerSection,
  ButtonMapping, ByteGrid, CalibrationLog, FlakyByteWarningDialog, WizardHeaderActions,
} from './hid-calibration/components';
import { RawAvailabilityNotice } from './hid-calibration/diagnostics/components';
import type { HidCalibrationWizardProps, HidWizardHandle } from './HidCalibrationWizard.type';

const HidCalibrationWizard = forwardRef<HidWizardHandle, HidCalibrationWizardProps>((props, ref) => {
  const { onComplete, onCancel, deviceKey, hideOwnActions = false, onCapturedCountChange, initialProfile, capturedEntry, initialProfileId, initialHasGyro } = props;
  const wiz = useHidCalibration({ onComplete, onCancel, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro });
  const [copyStatus, flashCopy] = useFlashStatus();
  const [saveStatus, flashSave] = useFlashStatus();

  useImperativeHandle(ref, () => ({
    copyJson: wiz.handleCopyJson,
    finish: wiz.handleFinish,
  }), [wiz.handleCopyJson, wiz.handleFinish]);

  useEffect(() => {
    onCapturedCountChange?.(wiz.capturedCount);
  }, [wiz.capturedCount, onCapturedCountChange]);

  // The device and its layout are settled before this component is reached,
  // so there is nothing to pick. This renders for the single frame between
  // mounting and the layout arriving.
  if (wiz.phase === 'select-profile') return null;

  return (
    <Box className="hid-cal">
      {/* Header */}
      <Box className="hid-cal__header">
        <Text as="h3" className="hid-cal__title">Byte capture — {wiz.profile?.name ?? 'Controller'}</Text>
        {!hideOwnActions && (
          <WizardHeaderActions
            copyStatus={copyStatus}
            saveStatus={saveStatus}
            capturedCount={wiz.capturedCount}
            onCopyJson={() => wiz.handleCopyJson().then(flashCopy)}
            onSaveDebugFile={() => wiz.handleSaveDebugFile().then(flashSave)}
            onFinish={wiz.handleFinish}
            onCancel={onCancel}
          />
        )}
      </Box>

      <InstructionsPanel />

      <LiveParserOutput profile={wiz.profile} state={wiz.liveParsedState} />

      {/* Prereqs: Gyro + Idle */}
      <PrereqCards
        hasGyro={wiz.hasGyro}
        gyroState={wiz.gyroState}
        idleState={wiz.idleState}
        gyroExcluded={wiz.gyroExcluded}
        latestBytesLength={wiz.latestBytes.length}
        onGyroStart={wiz.handleGyroStart}
        onGyroStop={wiz.handleGyroStop}
        onGyroRedo={wiz.handleGyroRedo}
        onGyroSkip={wiz.handleGyroSkip}
        onIdleCapture={wiz.handleIdleCapture}
        onIdleRedo={wiz.handleIdleRedo}
      />

      {/* Sticks + Triggers */}
      <StickTriggerSection wiz={wiz} />

      {/* Button Mapping */}
      <ButtonMapping
        items={wiz.items}
        buttonItems={wiz.buttonItems}
        buttonCapturedCount={wiz.buttonCapturedCount}
        activeIndex={wiz.activeIndex}
        inputPhaseActive={wiz.inputPhaseActive}
        autoAdvance={wiz.autoAdvance}
        captureState={wiz.captureState}
        axisSubStep={wiz.axisSubStep}
        instruction={wiz.getInstruction()}
        prereqsDone={wiz.prereqsDone}
        onStartButtons={wiz.handleStartButtons}
        onSkip={wiz.handleSkip}
        onGoBack={wiz.handleGoBack}
        onClickItem={wiz.handleClickItem}
        onClearItem={wiz.handleClearItem}
        setAutoAdvanceWrapped={wiz.setAutoAdvanceWrapped}
        setInputPhaseActiveWrapped={wiz.setInputPhaseActiveWrapped}
      />

      {/* Byte Grid. A controller can be held exclusively at a lower level, in
          which case no raw HID bytes are available. The wizard still runs on
          gamepad and joystick data, so show a notice rather than an empty grid. */}
      {wiz.rawAvailable ? (
        <ByteGrid
          latestBytes={wiz.latestBytes}
          byteStatuses={wiz.byteStatuses}
          gyroState={wiz.gyroState}
          stickPickMode={wiz.stickPickMode}
          stickPickedBytes={wiz.stickPickedBytes}
          triggerPickMode={wiz.triggerPickMode}
          triggerPickedByte={wiz.triggerPickedByte}
          inputPhaseActive={wiz.inputPhaseActive}
          lastReportId={wiz.lastReportId}
          baselineRef={wiz.baselineRef}
          excludedRef={wiz.excludedRef}
          itemsRef={wiz.itemsRef}
          activeIdxRef={wiz.activeIdxRef}
          inputPhaseActiveRef={wiz.inputPhaseActiveRef}
          getByteColor={wiz.getByteColor}
          onByteClick={wiz.handleByteClick}
        />
      ) : (
        <RawAvailabilityNotice available={false} reason={wiz.rawUnavailableReason} />
      )}

      {/* Log */}
      <CalibrationLog log={wiz.log} logRef={wiz.logRef} />

      <FlakyByteWarningDialog
        open={wiz.flakyDialogOpen}
        flakyBytes={wiz.flakyBytes}
        liveRanges={wiz.flakyLiveRanges}
        onExcludeAndContinue={wiz.onExcludeFlakyAndContinue}
        onContinueAnyway={wiz.onContinueFlakyAnyway}
        onCancel={wiz.onCancelFlakyDialog}
      />
    </Box>
  );
});

HidCalibrationWizard.displayName = 'HidCalibrationWizard';

export { HidCalibrationWizard };
export type { HidWizardHandle } from './HidCalibrationWizard.type';
export type {
  HidAxisMapping,
  HidButtonMapping,
  HidControllerMap,
} from './hid-calibration/hid-calibration.type';
export type { IdleByteAnalysis, IdleRecordResult } from './hid-calibration/hid-calibration.type';
