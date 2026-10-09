/* @layer bridge-wasm @kind constants */
import type { GameSettings } from '@rotp/features';

const RAW_FEATURE_KEYS = [
  'extendedRendering', 'linearWorldTilemap', 'ultrawideRendering', 'tallRendering',
  'widescreenSprites', 'widescreenVisualFixes', 'cameraLockToViewport', 'smoothTransitions',
  'perGroupVolume', 'autoSkipDialog',
  'prefillFileName',
  'coloredRupees', 'itemSheen', 'archeryNeedsBow',
] as const satisfies readonly (keyof GameSettings)[];

const WIDESCREEN_FIX_BUNDLE = 'WidescreenVisualFixes';

const GAME_CHANGING_FIX_BUNDLE = 'GameChangingBugFixes';

export { GAME_CHANGING_FIX_BUNDLE, RAW_FEATURE_KEYS, WIDESCREEN_FIX_BUNDLE };
