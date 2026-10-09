/* @layer shared-game @kind logic */
import type { TitleFrame } from '../title-frame.type';
import { FADE_STEPS, LOGO_LAYER_ON_AT, LOGO_SUBMODULE, MODULE_INTRO } from './title-phase.constants';

const logoAlpha = (f: TitleFrame): number => {
  if (f.module !== MODULE_INTRO) return 1;
  if (f.submodule < LOGO_SUBMODULE) return 0;
  if (f.submodule > LOGO_SUBMODULE) return 1;
  return f.fade > LOGO_LAYER_ON_AT ? 0 : (FADE_STEPS - f.fade) / FADE_STEPS;
};

export { logoAlpha };
