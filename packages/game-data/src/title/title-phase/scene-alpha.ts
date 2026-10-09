/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';
import { FADE_STEPS, MODULE_INTRO, SCENE_SUBMODULE } from './title-phase.constants';

const sceneAlpha = (f: TitleFrame): number => {
  if (f.module !== MODULE_INTRO) return 1;
  if (f.submodule < SCENE_SUBMODULE) return 0;
  if (f.submodule > SCENE_SUBMODULE) return 1;
  return (FADE_STEPS - f.fade) / FADE_STEPS;
};

export { sceneAlpha };
