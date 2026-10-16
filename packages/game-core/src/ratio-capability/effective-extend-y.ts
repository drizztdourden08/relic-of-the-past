/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';

const effectiveExtendY = (s: GameSettings): boolean => s.aspectRatio !== 'original' || s.extendY;

export { effectiveExtendY };
