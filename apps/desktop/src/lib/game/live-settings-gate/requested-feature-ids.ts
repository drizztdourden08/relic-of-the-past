/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { offscreenEnemyMode } from '../settings';
import { rendersExtended } from '../ratio-capability';
import { GAME_CHANGING_FIX_BUNDLE, RAW_FEATURE_KEYS, WIDESCREEN_FIX_BUNDLE } from './live-settings-gate.constants';

const derivedFeatureIds = (s: GameSettings): string[] => {
  const ids: string[] = [];
  if (offscreenEnemyMode(s) === 'idle') ids.push('offscreenAI');
  if (offscreenEnemyMode(s) === 'paused') ids.push('pauseOffscreenAI');
  if (s.titleScreen === 'reimagined') ids.push('titleOverride');
  if (s.widescreenPlayArea === true) ids.push('widescreenPlayArea');
  return ids;
};

const bugFixIds = (s: GameSettings): string[] => {
  const ids: string[] = [];
  for (const fix of BUNDLE_FIXES) {
    if (fix.bundleOrigin === WIDESCREEN_FIX_BUNDLE) {
      if (rendersExtended(s) && s.widescreenVisualFixes) ids.push(fix.id);
      continue;
    }
    const bundleMaster = fix.bundleOrigin === GAME_CHANGING_FIX_BUNDLE ? s.gameChangingBugFixes : s.miscBugFixes;
    if (s.bugFixToggles?.[fix.id] ?? bundleMaster) ids.push(fix.id);
  }
  return ids;
};

const requestedFeatureIds = (s: GameSettings): string[] => [
  ...RAW_FEATURE_KEYS.filter((key) => Boolean(s[key])),
  ...derivedFeatureIds(s),
  ...bugFixIds(s),
];

export { requestedFeatureIds };
