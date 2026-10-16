/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { baseRatio } from './base-ratio';
import { renderHeight } from './render-height';
import { requestedRatio } from './requested-ratio';
import { BASE_HEIGHT, BASE_WIDTH, STOCK_TILEMAP_WIDTH, ULTRAWIDE_RATIO } from './ratio-capability.constants';

const allowedRatio = (s: GameSettings): number => {
  const wanted = requestedRatio(s);
  if (!s.extendedRendering || wanted <= 0) return BASE_WIDTH / BASE_HEIGHT;
  if (s.aspectRatio === 'original') return wanted;
  const base = baseRatio(s);
  if (wanted < base) return s.tallRendering ? wanted : base;
  const linearLimit = STOCK_TILEMAP_WIDTH / renderHeight(s);
  if (!s.linearWorldTilemap && wanted > linearLimit) return linearLimit;
  if (!s.ultrawideRendering && wanted > ULTRAWIDE_RATIO) return ULTRAWIDE_RATIO;
  return wanted;
};

export { allowedRatio };
