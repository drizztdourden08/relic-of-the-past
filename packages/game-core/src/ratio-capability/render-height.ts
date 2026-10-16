/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { effectiveExtendY } from './effective-extend-y';
import { BASE_HEIGHT, EXTENDED_HEIGHT } from './ratio-capability.constants';

const renderHeight = (s: GameSettings): number => (effectiveExtendY(s) ? EXTENDED_HEIGHT : BASE_HEIGHT);

export { renderHeight };
