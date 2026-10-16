/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio } from './allowed-ratio';
import { baseRatio } from './base-ratio';

const rendersWide = (s: GameSettings): boolean =>
  s.extendedRendering && s.aspectRatio !== 'original' && allowedRatio(s) > baseRatio(s);

export { rendersWide };
