/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';
import { MAX_BRIGHTNESS } from './title-phase.constants';

const brightness = (f: TitleFrame): number => Math.min(MAX_BRIGHTNESS, f.inidisp & MAX_BRIGHTNESS) / MAX_BRIGHTNESS;

export { brightness };
