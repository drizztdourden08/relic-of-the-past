/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';
import { MODULE_INTRO, TRIFORCE_FIRST_SUBMODULE } from './title-phase.constants';

const triforceShown = (f: TitleFrame): boolean => f.module !== MODULE_INTRO || f.submodule >= TRIFORCE_FIRST_SUBMODULE;

export { triforceShown };
