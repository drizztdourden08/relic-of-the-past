/* @layer bridge-wasm @kind logic */
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { initHapticBridge } from '@app/input/haptic-bridge/init-haptic-bridge';
import { getPlatform } from '@drizztdourden08/brock-react';
import { useDialogStore } from '../../stores/dialog-store';
import { useGameUIStore } from '../../stores/game-ui-store';
import { saveOnQuit, startAutoSave } from '../auto-save';
import { deliveryQueue } from '../delivery-queue';
import { initDialogBridge, initTransitionEventsBridge, DEFAULT_SETTINGS, getProfileId, setInput, lifecycleState } from '@rotp/game-core';
import { startHostSubscriptions } from '../host-subscriptions';
import { reassertLiveFlagsAfterLoad } from '../live-settings';
import { startSession } from '../session-tracker';
import { startSramSync } from '../sram-sync';
import { initTrackerBridge } from '../tracker';
import { initUIBridge } from '../ui-bridge';

const startProfileServices = (): void => {
  const profileId = getProfileId();
  if (!profileId) return;
  startSession(profileId);
  startSramSync();
  const config = lifecycleState.activeAutoSaveConfig;
  if (config?.enabled) startAutoSave(config.intervalSeconds, config.maxEntries);
};

const startSessionServices = (profileId: string | null): void => {
  reassertLiveFlagsAfterLoad();
  startHostSubscriptions(profileId);
  const inputMgr = getInputManager();
  inputMgr.setWasmBridge(setInput);
  inputMgr.start();
  initTrackerBridge();
  initHapticBridge(DEFAULT_SETTINGS.haptics);
  initTransitionEventsBridge();
  getPlatform().device.keepAwake();
  lifecycleState.appPauseUnsub = getPlatform().device.onAppPause(() => { void saveOnQuit(); });
  initUIBridge(useGameUIStore.getState()._setState);
  initDialogBridge(useDialogStore.getState()._setFrame);
  deliveryQueue.startProcessing();
  startProfileServices();
};

export { startSessionServices };
