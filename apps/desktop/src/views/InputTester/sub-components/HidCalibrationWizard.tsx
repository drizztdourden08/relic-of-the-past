/* @layer renderer-components @kind component */
import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useHidCalibration } from './hid-calibration/hooks';
import { useFlashStatus } from './hid-calibration/hooks/useFlashStatus';
import {
  InstructionsPanel, LiveParserOutput, StickTriggerSection,
  CalibrationLog, FlakyByteWarningDialog, WizardHeaderActions,
} from './hid-calibration/components';
import { WizardByteSection } from './hid-calibration/components/WizardByteSection';
import { WizardMappingSection } from './hid-calibration/components/WizardMappingSection';
import { WizardPrereqSection } from './hid-calibration/components/WizardPrereqSection';
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

  const { handleCopyJson, handleSaveDebugFile } = wiz;
  const handleCopy = useCallback(() => handleCopyJson().then(flashCopy), [handleCopyJson, flashCopy]);
  const handleSave = useCallback(() => handleSaveDebugFile().then(flashSave), [handleSaveDebugFile, flashSave]);

  if (wiz.phase === 'select-profile') return null;

  return (
    <Box className="hid-cal">
      <Box className="hid-cal__header">
        <Text as="h3" className="hid-cal__title">Byte capture for {wiz.profile?.name ?? 'Controller'}</Text>
        {!hideOwnActions && (
          <WizardHeaderActions
            copyStatus={copyStatus}
            saveStatus={saveStatus}
            capturedCount={wiz.capturedCount}
            onCopyJson={handleCopy}
            onSaveDebugFile={handleSave}
            onFinish={wiz.handleFinish}
            onCancel={onCancel}
          />
        )}
      </Box>

      <InstructionsPanel />
      <LiveParserOutput profile={wiz.profile} state={wiz.liveParsedState} />
      <WizardPrereqSection wiz={wiz} />
      <StickTriggerSection wiz={wiz} />
      <WizardMappingSection wiz={wiz} />
      <WizardByteSection wiz={wiz} />
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
export type { HidControllerMap } from './hid-calibration/hid-calibration.type';
