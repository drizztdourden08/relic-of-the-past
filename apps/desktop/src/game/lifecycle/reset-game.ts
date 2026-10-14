/* @layer bridge-wasm @kind logic */
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { destroyHapticBridge } from '@rotp/input-mapping';
import { getPlatform } from '@drizztdourden08/brock-react';
import { stopAutoSave } from '../auto-save';
import { resetMasterVolume, resetHostGates, stopDialogBridge, clearGlyphAtlas, destroyTransitionEventsBridge, setModule, setProfileId, setState, lifecycleState } from '@rotp/game-core';
import { deliveryQueue } from '../delivery-queue';
import { stopHostSubscriptions } from '../host-subscriptions';
import { endSession } from '../session-tracker';
import { stopSramSync } from '../sram-sync';
import { destroyTrackerBridge } from '../tracker';
import { stopUIBridge } from '../ui-bridge';
import { rotpCore } from './rotp-core';
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
  rotpCore.stop();
  setModule(null);
  setProfileId(null);
  Object.assign(window, { __zelda3Module: null });
  resetHostGates();
  stopHostSubscriptions();
  setState({ status: 'idle', error: null });
};

export { resetGame };
