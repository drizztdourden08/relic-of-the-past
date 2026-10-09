/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { requestedRatio } from './requested-ratio';
import { LINEAR_RATIO, TALL_RATIO, ULTRAWIDE_RATIO } from './ratio-capability.constants';

const allowedRatio = (s: GameSettings): number => {
  const wanted = requestedRatio(s);
  if (!s.extendedRendering || wanted <= 0) return TALL_RATIO;
  if (wanted < TALL_RATIO) return s.tallRendering ? wanted : TALL_RATIO;
  if (wanted > ULTRAWIDE_RATIO && !s.ultrawideRendering) {
    return s.linearWorldTilemap ? ULTRAWIDE_RATIO : LINEAR_RATIO;
  }
  if (wanted > LINEAR_RATIO && !s.linearWorldTilemap) return LINEAR_RATIO;
  return wanted;
};

export { allowedRatio };
