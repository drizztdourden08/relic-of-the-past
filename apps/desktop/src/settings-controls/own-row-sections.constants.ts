/* @layer renderer-app @kind constants */
import { BUNDLE_FIXES } from '@rotp/features';
import { DEVICE_KEYS, VOLUME_ROWS } from './audio/audio-controls.constants';
import { COLOR_KEYS } from './hud/hud-controls.constants';
import { SESSION_ITEMS } from './online/online-rows.constants';

const OWN_ROW_KEYS: ReadonlySet<string> = new Set<string>([
  'aspectRatio', 'vsync', 'linkSprite',
  'turboSpeed', 'dialogSpeed', 'dialogHoldToAccelerate', 'saveHoldDuration',
  'enableMSU', ...DEVICE_KEYS, ...Object.keys(VOLUME_ROWS),
  'hudStyle', 'hudRatio', 'titleSword', 'dialogFontScale', 'dialogStrokeWidth', 'dialogTextureScale', ...COLOR_KEYS,
  ...Object.keys(SESSION_ITEMS),
  'sanctuaryAccount',
  ...BUNDLE_FIXES.map((fix) => fix.id),
]);

const HAPTICS_PREFIX = 'haptics.';

export { HAPTICS_PREFIX, OWN_ROW_KEYS };
