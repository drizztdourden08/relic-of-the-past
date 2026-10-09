/* @layer bridge-wasm @kind logic */
import { getInputManager } from '../../input/input-manager';
import { destroyHapticBridge } from '../../input/haptic-bridge';
import { getPlatform } from '../../../platform/get-platform';
import { stopAutoSave } from '../auto-save';
import { resetMasterVolume } from '../audio-volume';
import { resetHostGates } from '../bridge/host-gates';
import { deliveryQueue } from '../delivery-queue';
import { stopDialogBridge } from '../dialog/dialog-bridge';
import { clearGlyphAtlas } from '../dialog/glyph-atlas';
import { destroyTransitionEventsBridge } from '../events/transition-events';
import { stopHostSubscriptions } from '../host-subscriptions';
import { endSession } from '../session-tracker';
import { stopSramSync } from '../sram-sync';
import { destroyTrackerBridge } from '../tracker';
import { stopUIBridge } from '../ui-bridge';
import { getModule, setModule, setProfileId, setState } from '../wasm-bridge';
import { detachCrashHandler } from './detach-crash-handler';
import { lifecycleState } from './lifecycle-state';
import { releaseCoreModule } from './release-core-module';
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
