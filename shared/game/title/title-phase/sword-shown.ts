/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';
import { MODULE_INTRO, SWORD_SUBMODULE } from './title-phase.constants';

const swordShown = (f: TitleFrame): boolean => f.module !== MODULE_INTRO || f.submodule >= SWORD_SUBMODULE;

export { swordShown };
