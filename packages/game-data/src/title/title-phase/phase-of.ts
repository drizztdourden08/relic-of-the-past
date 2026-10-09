/* @layer shared-game @kind logic */
import type { TitleFrame, TitlePhase } from '../title-frame.type';
import { LOGO_SUBMODULE, MODULE_ATTRACT, MODULE_INTRO, SCENE_SUBMODULE, SWORD_SUBMODULE } from './title-phase.constants';

const phaseOf = (f: TitleFrame): TitlePhase => {
  if (f.module === MODULE_ATTRACT) return f.attractState === 0 ? 'idle' : 'gone';
  if (f.module !== MODULE_INTRO) return 'gone';
  if (f.submodule <= 2) return 'boot';
  if (f.submodule <= 4) return 'triforce';
  if (f.submodule === LOGO_SUBMODULE) return 'logo';
  if (f.submodule === SWORD_SUBMODULE) return 'sword';
  if (f.submodule === SCENE_SUBMODULE && f.fade > 0) return 'scene';
  return 'idle';
};

export { phaseOf };
