/* @layer bridge-wasm @kind logic */
import { createLiveSettings } from '@drizztdourden08/brock-port-kit/renderer';
import type { GameSettings } from '@rotp/features';
import { log } from '../../log-bus';
import { setSettingsStoryGates } from '../story-gates';
import { applyLiveSettings } from './apply-live-settings';
import { currentCoreCalls } from './current-core-calls';

const liveSettings = createLiveSettings<GameSettings>({ calls: currentCoreCalls, apply: applyLiveSettings });

const pushLiveSettings = (settings: GameSettings): boolean => {
  setSettingsStoryGates(settings.vanillaSafe);
  try {
    const pushed = liveSettings.push(settings);
    if (!pushed) log.app('Live settings: no WASM module available', 'warn');
    return pushed;
  } catch (e) {
    log.app(`Live settings push failed: ${e}`, 'error');
    return false;
  }
};

export { pushLiveSettings };
