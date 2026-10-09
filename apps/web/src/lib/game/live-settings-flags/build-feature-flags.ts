/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { effectiveFeatureIds } from '../live-settings-gate';
import { offscreenEnemyMode, rendersExtended } from '../settings';
import { featureOverrides } from './feature-overrides';
import { FEATURE_FLAGS, UNREGISTERED_QUALITY_OF_LIFE_KEYS } from './live-settings-flags.constants';

const registeredBits = (s: GameSettings): number => {
  const effective = effectiveFeatureIds(s);
  const isOn = (id: string): boolean => effective.has(id);
  const wideView = isOn('extendedRendering') && rendersExtended(s);
  let flags = 0;
  if (isOn('extendedRendering')) flags |= FEATURE_FLAGS.extendedRendering;
  if (isOn('linearWorldTilemap')) flags |= FEATURE_FLAGS.linearWorldTilemap;
  if (isOn('ultrawideRendering')) flags |= FEATURE_FLAGS.ultrawide;
  if (isOn('tallRendering')) flags |= FEATURE_FLAGS.tallRender;
  if (wideView && isOn('widescreenSprites')) flags |= FEATURE_FLAGS.extendScreen64;
  if (wideView && isOn('widescreenVisualFixes')) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (isOn('cameraLockToViewport')) flags |= FEATURE_FLAGS.cameraLockToViewport;
  if (isOn('smoothTransitions')) flags |= FEATURE_FLAGS.smoothTransitions;
  if (isOn('pauseOffscreenAI') && offscreenEnemyMode(s) === 'paused') flags |= FEATURE_FLAGS.pauseOffscreenEnemies;
  const autoSkipDialog = featureOverrides.autoSkipDialog ?? isOn('autoSkipDialog');
  if (autoSkipDialog) flags |= FEATURE_FLAGS.autoSkipDialog;
  if (isOn('prefillFileName')) flags |= FEATURE_FLAGS.prefillFileName;
  if (isOn('perGroupVolume')) flags |= FEATURE_FLAGS.perGroupVolume;
  return flags;
};

const unregisteredBits = (s: GameSettings): number => {
  if (s.vanillaSafe) return 0;
  let flags = 0;
  for (const key of UNREGISTERED_QUALITY_OF_LIFE_KEYS) {
    if (s[key]) flags |= FEATURE_FLAGS[key];
  }
  if (s.haptics?.enabled) flags |= FEATURE_FLAGS.haptics;
  const developerToolsWanted = featureOverrides.developerTools ?? s.developerToolsEnabled;
  if (developerToolsWanted) flags |= FEATURE_FLAGS.developerTools;
  return flags;
};

const buildFeatureFlags = (s: GameSettings): number =>
  (registeredBits(s) | unregisteredBits(s)) >>> 0;

export { buildFeatureFlags };
