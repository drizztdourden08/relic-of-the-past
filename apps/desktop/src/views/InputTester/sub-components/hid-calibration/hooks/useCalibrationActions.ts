/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ActionDeps } from './action-deps.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { useByteClick } from './useByteClick';
import { useCalibrationExport } from './useCalibrationExport';
import { useGyroIdleActions } from './useGyroIdleActions';
import { useItemActions } from './useItemActions';
import { useManualByteAssign } from './useManualByteAssign';
import { useStickActions } from './useStickActions';
import { useTriggerActions } from './useTriggerActions';
import { buildProfileItems } from './build-profile-items';

const useCalibrationActions = (d: ActionDeps) => {
  const handleProfileConfirm = useCallback(() => {
    const p = d.detectedProfile; if (!p) return;
    d.setProfile(p);
    const items = buildProfileItems(p, STICK_IDS, TRIGGER_IDS);
    d.setItems(items); d.setPhase('live');
    d.addLog(`Calibrating ${p.name} with ${items.length} inputs`);
  }, [d.detectedProfile, d.addLog]);

  const gyroIdle = useGyroIdleActions(d);
  const stick = useStickActions(d);
  const trigger = useTriggerActions(d);
  const { handleManualByteAssign } = useManualByteAssign(d);
  const itemActions = useItemActions(d, gyroIdle.ensureBaseline);
  const { handleByteClick } = useByteClick(d, {
    handleStickBytePicked: stick.handleStickBytePicked,
    handleTriggerBytePicked: trigger.handleTriggerBytePicked,
    handleManualByteAssign,
  });
  const { handleCopyJson, handleFinish, handleSaveDebugFile } = useCalibrationExport(d);

  return {
    handleProfileConfirm,
    handleGyroStart: gyroIdle.handleGyroStart, handleGyroStop: gyroIdle.handleGyroStop, handleGyroRedo: gyroIdle.handleGyroRedo,
    handleGyroSkip: gyroIdle.handleGyroSkip, handleIdleCapture: gyroIdle.handleIdleCapture, handleIdleRedo: gyroIdle.handleIdleRedo,
    ...stick,
    ...trigger,
    ...itemActions,
    handleManualByteAssign, handleByteClick, handleCopyJson, handleFinish, handleSaveDebugFile,
  };
};

export { useCalibrationActions };
