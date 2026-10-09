/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';

const flashOn = (f: TitleFrame): boolean => f.flashLeft > 0 && (f.flashLeft & 3) !== 0;

export { flashOn };
