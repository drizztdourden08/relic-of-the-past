/* @layer bridge-wasm @kind logic */
import type { UIMode } from '@rotp/game-data';
import {
  INTERFACE_SUBMODULE_MODES,
  LOADING_MODULES,
  MODULE,
  OVERWORLD_SPECIAL_AREA_SCREEN_MIN,
  TITLE_MODULES,
} from './ui-bridge-parser.constants';

const deriveUIMode = (mainModule: number, subModule: number, overworldScreenIndex: number): UIMode => {
  if (TITLE_MODULES.includes(mainModule)) return 'title';
  if (LOADING_MODULES.includes(mainModule)) return 'loading';
  switch (mainModule) {
    case MODULE.fallingEntrance: {
      const overworldSwitchTile = overworldScreenIndex >= OVERWORLD_SPECIAL_AREA_SCREEN_MIN;
      return overworldSwitchTile ? 'gameplay' : 'loading';
    }
    case MODULE.interface:
      return INTERFACE_SUBMODULE_MODES[subModule] ?? 'gameplay';
    case MODULE.gameOver:
      return 'game_over';
    case MODULE.saveAndQuit:
      return 'save_and_quit';
    default:
      return 'gameplay';
  }
};

export { deriveUIMode };
