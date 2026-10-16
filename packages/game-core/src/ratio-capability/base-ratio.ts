/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { renderHeight } from './render-height';
import { BASE_WIDTH } from './ratio-capability.constants';

const baseRatio = (s: GameSettings): number => BASE_WIDTH / renderHeight(s);

export { baseRatio };
