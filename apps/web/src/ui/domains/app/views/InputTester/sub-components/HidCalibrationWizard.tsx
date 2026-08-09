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
import { Button } from '../../../../../design-system/primitives/Button';
import type { HidAxisMapping, HidButtonMapping, HidControllerMap } from './hid-calibration/hid-calibration.type';
import { useHidCalibration } from './hid-calibration/hooks';
import { useFlashStatus } from './hid-calibration/hooks/useFlashStatus';
import {
  ProfileSelector, InstructionsPanel, LiveParserOutput, PrereqCards, StickCards, TriggerCards,
  ButtonMapping, ByteGrid, CalibrationLog,
} from './hid-calibration/components';
import type { HidCalibrationWizardProps, HidWizardHandle } from './HidCalibrationWizard.type';

const HidCalibrationWizard = forwardRef<HidWizardHandle, HidCalibrationWizardProps>((props, ref) => {
  const { onComplete, onCancel, deviceKey, hideOwnActions = false, onCapturedCountChange } = props;
  const wiz = useHidCalibration({ onComplete, onCancel, deviceKey });
  const [copyStatus, flashCopy] = useFlashStatus();
  const [saveStatus, flashSave] = useFlashStatus();

  useImperativeHandle(ref, () => ({
    copyJson: wiz.handleCopyJson,
    finish: wiz.handleFinish,
  }), [wiz.handleCopyJson, wiz.handleFinish]);

  useEffect(() => {
    onCapturedCountChange?.(wiz.capturedCount);
  }, [wiz.capturedCount, onCapturedCountChange]);

  if (wiz.phase === 'select-profile') {
    return (
      <ProfileSelector
        selectedProfileId={wiz.selectedProfileId}
        selectedSdlVidPid={wiz.selectedSdlVidPid}
        hasGyro={wiz.hasGyro}
        sdlOptions={wiz.sdlOptions}
        onSdlSelect={wiz.handleSdlSelect}
        onConfirm={wiz.handleProfileConfirm}
        onCancel={onCancel}
        log={wiz.log}
        logRef={wiz.logRef}
      />
    );
  }

  return (
    <Box className="hid-cal">
      {/* Header */}
      <Box className="hid-cal__header">
        <Text as="h3" className="hid-cal__title">HID Calibration — {wiz.profile?.name ?? 'Controller'}</Text>
        {!hideOwnActions && (
          <Box className="hid-cal__header-actions">
            <Button variant={copyStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={() => wiz.handleCopyJson().then(flashCopy)} title="Copy partial or complete calibration JSON">
              {copyStatus === 'ok' ? '✓ Copied' : copyStatus === 'error' ? '✗ Failed' : 'Copy JSON'}
            </Button>
            <Button variant={saveStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={() => wiz.handleSaveDebugFile().then(flashSave)} title="Write calibration JSON to the userData debug folder">
              {saveStatus === 'ok' ? '✓ Saved' : saveStatus === 'error' ? '✗ Failed' : 'Save to Debug Folder'}
            </Button>
            <Button variant="primary" size="sm" onClick={wiz.handleFinish} disabled={wiz.capturedCount === 0}>
              Finish
            </Button>
            <Button variant="danger" size="sm" onClick={onCancel}>Cancel</Button>
          </Box>
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

      {/* Sticks */}
      {wiz.prereqsDone && (
        <StickCards
          items={wiz.items}
          activeStick={wiz.activeStick}
          stickBusy={wiz.stickBusy}
          stickLiveInfo={wiz.stickLiveInfo}
          stickPickMode={wiz.stickPickMode}
          stickPickedBytes={wiz.stickPickedBytes}
          idleRecording={wiz.idleRecording}
          idleResults={wiz.idleResults}
          onStartCircle={wiz.handleStartCircle}
          onStopCircle={wiz.handleStopCircle}
          onSkipStick={wiz.handleSkipStick}
          onStickRedo={wiz.handleStickRedo}
          onStickPickMode={wiz.handleStickPickMode}
          onConfirmPick={wiz.handleConfirmPick}
          onCancelPick={wiz.handleCancelPick}
          onIdleRecord={wiz.handleIdleRecord}
        />
      )}

      {/* Triggers */}
      {wiz.prereqsDone && (
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
      )}

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

      {/* Byte Grid */}
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

      {/* Log */}
      <CalibrationLog log={wiz.log} logRef={wiz.logRef} />
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
