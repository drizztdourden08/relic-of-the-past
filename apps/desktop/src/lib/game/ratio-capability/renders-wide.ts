/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { allowedRatio } from './allowed-ratio';
import { TALL_RATIO } from './ratio-capability.constants';

const rendersWide = (s: GameSettings): boolean => s.extendedRendering && allowedRatio(s) > TALL_RATIO;

export { rendersWide };
