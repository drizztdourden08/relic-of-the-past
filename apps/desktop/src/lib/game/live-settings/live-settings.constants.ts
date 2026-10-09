/* @layer bridge-wasm @kind constants */
import type { GameSettings } from '@shared/types/settings';
import { QUIET_RECEIPT_KEY, QUIET_RECEIPT_KINDS } from '@rotp/game-data';
import { LIVE_SETTING_KEYS } from '../live-settings-keys';

const LIVE_SETTINGS: ReadonlySet<keyof GameSettings> = new Set<keyof GameSettings>([
  ...LIVE_SETTING_KEYS,
  ...QUIET_RECEIPT_KINDS.map((kind) => QUIET_RECEIPT_KEY[kind]),
]);

const PERCENT_TO_WASM_VOLUME = 1.28;

const FEATURES3_GATE_WORD = 3;

export { FEATURES3_GATE_WORD, LIVE_SETTINGS, PERCENT_TO_WASM_VOLUME };
