/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { BUNDLE_FIXES } from '@rotp/features';
import { controlSchemeOf, hostDrawnHud } from '@rotp/features';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenEnemyMode } from './settings';
import { BUG_FIX_WORD_FEATURES2, FEATURES2_FLAGS } from './live-settings-feature-words.constants';

const modernControlsWanted = (s: GameSettings): boolean =>
  controlSchemeOf(s) === 'modern' && !s.vanillaSafe;

const hostMenuWanted = (s: GameSettings): boolean =>
  !s.vanillaSafe && hostDrawnHud(s.hudStyle);

const bugFixWords = (effective: Set<string>): { features1: number; features2: number } => {
  let features1 = 0;
  let features2 = 0;
  for (const fix of BUNDLE_FIXES) {
    if (!effective.has(fix.id) || !fix.bit) continue;
    if (fix.word === BUG_FIX_WORD_FEATURES2) features2 |= fix.bit;
    else features1 |= fix.bit;
  }
  return { features1, features2 };
};

const wideViewBits = (s: GameSettings, effective: Set<string>): number => {
  const wideView = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (!wideView) return 0;
  let bits = 0;
  if (effective.has('widescreenPlayArea')) bits |= FEATURES2_FLAGS.widescreenPlayArea;
  if (effective.has('offscreenAI') && offscreenEnemyMode(s) === 'idle') bits |= FEATURES2_FLAGS.widescreenIdleEnemies;
  return bits;
};

const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  const effective = effectiveFeatureIds(s);
  const { features1, features2: fixBits } = bugFixWords(effective);
  let f2 = fixBits | wideViewBits(s, effective);
  if (effective.has('titleOverride')) f2 |= FEATURES2_FLAGS.titleOverride;
  if (modernControlsWanted(s)) f2 |= FEATURES2_FLAGS.modernControls;
  if (hostMenuWanted(s)) f2 |= FEATURES2_FLAGS.hostMenu;
  if (s.allowDiving || s.extraDungeon) f2 |= FEATURES2_FLAGS.allowDiving;
  return { features1, features2: f2 };
};

export { buildFeatureWords };
