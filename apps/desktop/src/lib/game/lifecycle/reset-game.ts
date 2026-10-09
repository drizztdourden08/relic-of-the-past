/* @layer bridge-wasm @kind logic */
import { getInputManager } from '@app/lib/input/input-manager/get-input-manager';
import { destroyHapticBridge } from '@rotp/input-mapping';
import { getPlatform } from '@drizztdourden08/brock-react';
import { stopAutoSave } from '../auto-save';
import { resetMasterVolume } from '@rotp/game-core';
import { resetHostGates } from '@rotp/game-core';
import { deliveryQueue } from '../delivery-queue';
import { stopDialogBridge } from '@rotp/game-core';
import { clearGlyphAtlas } from '@rotp/game-core';
import { destroyTransitionEventsBridge } from '@rotp/game-core';
import { stopHostSubscriptions } from '../host-subscriptions';
import { endSession } from '../session-tracker';
import { stopSramSync } from '../sram-sync';
import { destroyTrackerBridge } from '../tracker';
import { stopUIBridge } from '../ui-bridge';
import { getModule, setModule, setProfileId, setState } from '@rotp/game-core';
import { detachCrashHandler } from '@rotp/game-core';
import { lifecycleState } from '@rotp/game-core';
import { releaseCoreModule } from '@rotp/game-core';
import { saveBeforeQuit } from './save-before-quit';

const stopSessionServices = (): void => {
  stopAutoSave();
  stopSramSync();
  stopUIBridge();
  stopDialogBridge();
  clearGlyphAtlas();
  deliveryQueue.stopProcessing();
  deliveryQueue.clear();
  destroyTrackerBridge();
  destroyHapticBridge();
  destroyTransitionEventsBridge();
  lifecycleState.appPauseUnsub?.();
  lifecycleState.appPauseUnsub = null;
  getPlatform().device.allowSleep();
  resetMasterVolume();
  getInputManager().stop();
};

const resetGame = async (): Promise<void> => {
  await saveBeforeQuit();
  await endSession();
  stopSessionServices();
  detachCrashHandler();
  const mod = getModule();
  if (mod) releaseCoreModule(mod);
  setModule(null);
  setProfileId(null);
  Object.assign(window, { __zelda3Module: null });
  resetHostGates();
  stopHostSubscriptions();
  setState({ status: 'idle', error: null });
};

export { resetGame };
