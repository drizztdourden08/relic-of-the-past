/* @layer bridge-wasm @kind logic */
/** The PPU render-flag builder for live WASM settings — values must match ppu.h. */
import type { GameSettings } from '@shared/types/settings';

// PPU render flag values — must match ppu.h
const PPU_FLAGS = {
  newRenderer:    1,
  mode7_4x4:     2,
  height240:     4,
  noSpriteLimits: 8,
} as const;

// None of these four are registered FeatureDefs yet (they predate the registry and aren't part of the
// 16-flag snesrev QoL follow-up either), so Vanilla Safe can't reach them through effectiveFeatureIds —
// each is hand-gated below instead. newRenderer is the odd one out: per its own settings copy ("a faster,
// rewritten pixel processing unit ... visually identical") it's a pure engine swap with no rendered-pixel
// difference, so it stays on even under Vanilla Safe. The other three visibly change what's on screen
// versus the cartridge (more/taller visible area, no OAM-driven sprite flicker/drop, smoothed Mode 7), so
// they're forced off the same as any other affectsVanillaParity: true feature.
const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (!s.vanillaSafe && s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  // extend_y (240 lines) must track the INI serializer, which only emits it when extendedRendering is on
  // (and never under Vanilla Safe — see serializeToIni). The render-buffer height is baked at init from
  // that INI value; setting the live Height240 flag without it would make the draw loop's botBudget
  // disagree with the allocated texture (ppu.c PpuSetExtraSideSpace).
  if (!s.vanillaSafe && s.extendedRendering && s.extendY) flags |= PPU_FLAGS.height240;
  if (!s.vanillaSafe && s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildPpuFlags };
