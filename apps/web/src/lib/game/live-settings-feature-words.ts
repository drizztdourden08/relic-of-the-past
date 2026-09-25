/* @layer bridge-wasm @kind logic */
/**
 * The two extra bitmask words (features1/features2): the 42 split bug-fix toggles from the generated
 * registry, plus the hand-authored features2 bits. Every id goes through the Vanilla Safe resolver, so
 * a parity-affecting bit is dropped there before it is packed here.
 */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { controlSchemeOf, hostDrawnHud } from '@shared/features/hud-style';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenAiMode } from './settings';

// Hand-authored features2 bits, allocated downward from bit 24; the generated bug-fix catalog
// (BUNDLE_FIXES) owns features2 upward from bit 0. Values must match features.h.
const FEATURES2_FLAGS = {
  widescreenPlayArea: 16777216, // kFeatures2_WidescreenPlayArea = 1 << 24
  widescreenIdleAI: 33554432, // kFeatures2_WidescreenIdleAI = 1 << 25
  titleOverride: 67108864, // kFeatures2_TitleOverride = 1 << 26
  hostMenu: 134217728, // kFeatures2_HostMenu = 1 << 27
  modernControls: 268435456, // kFeatures2_ModernControls = 1 << 28
} as const;

/** The modern control scheme may drive the item register. It IS the Modern HUD style, which is
 *  also the HUD that can show the bindings, so this is one condition and never two that disagree. */
const modernControlsWanted = (s: GameSettings): boolean =>
  controlSchemeOf(s) === 'modern' && !s.vanillaSafe;

/** The host may own the pause menu: both host-drawn styles ask for it. */
const hostMenuWanted = (s: GameSettings): boolean =>
  !s.vanillaSafe && hostDrawnHud(s.hudStyle);

// Each fix is on when its granular toggle is set, falling back to the legacy bundle setting it was
// extracted from so existing profiles keep their behavior. Values come from the generated registry
// (must match features_bugfixes.h).
const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  const effective = effectiveFeatureIds(s);
  let f1 = 0;
  let f2 = 0;
  for (const fix of BUNDLE_FIXES) {
    if (!effective.has(fix.id) || !fix.bit) continue;
    if (fix.word === 2) f2 |= fix.bit;
    else f1 |= fix.bit;
  }
  // The wide-view condition stays separate because it depends on aspectRatio, not on another feature id.
  const wide = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (wide) {
    if (effective.has('widescreenPlayArea')) f2 |= FEATURES2_FLAGS.widescreenPlayArea;
    if (effective.has('offscreenAI') && offscreenAiMode(s) === 'idle') f2 |= FEATURES2_FLAGS.widescreenIdleAI;
  }
  // The title hide: registered, so Vanilla Safe strips it through the same resolver.
  if (effective.has('titleOverride')) f2 |= FEATURES2_FLAGS.titleOverride;
  // Host-owned pause menu and host-driven item register. Neither is a raw user toggle: both are
  // derived from the HUD style, and both are stripped by Vanilla Safe here and by the
  // C-side kGateWordParityMask. modernControls implies hostMenu: the host writes hud_cur_item with a
  // NEW-STYLE item id (1..24), and the HostMenu gate is what makes Hud_LookupInventoryItem read the
  // new-style table at all. Granting it only permits the takeover; the host still has to ask for it
  // (WasmHostMenuSetTakeover).
  if (modernControlsWanted(s)) f2 |= FEATURES2_FLAGS.modernControls;
  if (hostMenuWanted(s)) f2 |= FEATURES2_FLAGS.hostMenu;
  return { features1: f1, features2: f2 };
};

export { buildFeatureWords, FEATURES2_FLAGS };
