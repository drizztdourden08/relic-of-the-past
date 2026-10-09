/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { PPU_FLAGS } from './live-settings-ppu-flags.constants';

const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (!s.vanillaSafe && s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  if (!s.vanillaSafe && s.extendedRendering && s.extendY) flags |= PPU_FLAGS.height240;
  if (!s.vanillaSafe && s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildPpuFlags };
