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
import type { HidAxisMapping, HidButtonMapping, HidControllerMap } from './hid-calibration/types';
import { useHidCalibration } from './hid-calibration/hooks';
import {
  ProfileSelector, PrereqCards, StickCards, TriggerCards,
  ButtonMapping, ByteGrid, CalibrationLog,
} from './hid-calibration/components';

interface Props {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
}

const HidCalibrationWizard = (props: Props) => {
  const { onComplete, onCancel, deviceKey } = props;
  const wiz = useHidCalibration({ onComplete, onCancel, deviceKey });

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
    <div className="hid-cal">
      {/* Header */}
      <div className="hid-cal__header">
        <h3 className="hid-cal__title">HID Calibration — {wiz.profile?.name ?? 'Controller'}</h3>
        <div className="hid-cal__header-actions">
          <button onClick={wiz.handleCopyJson} className="input-cal__btn" title="Copy partial or complete calibration JSON">
            Copy JSON
          </button>
          <button onClick={wiz.handleFinish} className="input-cal__btn input-cal__btn--primary" disabled={wiz.capturedCount === 0}>
            Finish
          </button>
          <button onClick={onCancel} className="input-cal__btn input-cal__btn--danger">Cancel</button>
        </div>
      </div>

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
    </div>
  );
};

export { HidCalibrationWizard };
export type {
  HidAxisMapping,
  HidButtonMapping,
  HidControllerMap,
} from './hid-calibration/types';
export type { IdleByteAnalysis, IdleRecordResult } from './hid-calibration/types';
