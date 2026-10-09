/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { liveSettingsState } from './live-settings-state';

const liveSettingsNow = (): GameSettings | null => liveSettingsState.settings;

export { liveSettingsNow };
