/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { effectiveFeatureIds } from '../live-settings-gate';
import { offscreenEnemyMode, rendersExtended } from '../settings';
import { featureOverrides } from './feature-overrides';
import { FEATURE_FLAGS, UNREGISTERED_QUALITY_OF_LIFE_KEYS } from './live-settings-flags.constants';

const flagsFrom = (bits: readonly (readonly [boolean, number])[]): number =>
  bits.reduce((flags, [on, bit]) => (on ? flags | bit : flags), 0);

const registeredBits = (s: GameSettings): number => {
  const effective = effectiveFeatureIds(s);
  const isOn = (id: string): boolean => effective.has(id);
  const wideView = isOn('extendedRendering') && rendersExtended(s);
  return flagsFrom([
    [isOn('extendedRendering'), FEATURE_FLAGS.extendedRendering],
    [isOn('linearWorldTilemap'), FEATURE_FLAGS.linearWorldTilemap],
    [isOn('ultrawideRendering'), FEATURE_FLAGS.ultrawide],
    [isOn('tallRendering'), FEATURE_FLAGS.tallRender],
    [wideView && isOn('widescreenSprites'), FEATURE_FLAGS.extendScreen64],
    [wideView && isOn('widescreenVisualFixes'), FEATURE_FLAGS.widescreenVisualFixes],
    [isOn('cameraLockToViewport'), FEATURE_FLAGS.cameraLockToViewport],
    [isOn('smoothTransitions'), FEATURE_FLAGS.smoothTransitions],
    [isOn('pauseOffscreenAI') && offscreenEnemyMode(s) === 'paused', FEATURE_FLAGS.pauseOffscreenEnemies],
    [featureOverrides.autoSkipDialog ?? isOn('autoSkipDialog'), FEATURE_FLAGS.autoSkipDialog],
    [isOn('prefillFileName'), FEATURE_FLAGS.prefillFileName],
    [isOn('perGroupVolume'), FEATURE_FLAGS.perGroupVolume],
  ]);
};

const unregisteredBits = (s: GameSettings): number => {
  if (s.vanillaSafe) return 0;
  let flags = 0;
  for (const key of UNREGISTERED_QUALITY_OF_LIFE_KEYS) {
    if (s[key]) flags |= FEATURE_FLAGS[key];
  }
  if (s.haptics.enabled) flags |= FEATURE_FLAGS.haptics;
  const developerToolsWanted = featureOverrides.developerTools ?? s.developerToolsEnabled;
  if (developerToolsWanted) flags |= FEATURE_FLAGS.developerTools;
  return flags;
};

const buildFeatureFlags = (s: GameSettings): number =>
  (registeredBits(s) | unregisteredBits(s)) >>> 0;

export { buildFeatureFlags };
