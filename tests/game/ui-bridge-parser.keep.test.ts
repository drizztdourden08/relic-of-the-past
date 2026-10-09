/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import type { UIMode } from '@rotp/game-data';
import { parseGameUIBuffer } from '../../apps/desktop/src/lib/game/ui-bridge-parser';
import { isMainHudVisibleForMode } from '../../apps/desktop/src/ui/domains/hud/hud-visibility';

const UI_BUFFER_SIZE = 128;
const MAIN_MODULE_OFFSET = 0;
const ATTRACT_MODULE = 20;
const FILE_MENU_MODULES = [0, 1, 2, 3, 4];

const modeForModule = (mainModule: number): UIMode => {
  const buffer = new Uint8Array(UI_BUFFER_SIZE);
  buffer[MAIN_MODULE_OFFSET] = mainModule;
  return parseGameUIBuffer(buffer, 0).mode;
};

describe('deriveUIMode (via parseGameUIBuffer)', () => {
  it('maps the intro attract demo and file-select menus to title (HUD hidden)', () => {
    for (const mainModule of [...FILE_MENU_MODULES, ATTRACT_MODULE]) {
      expect(modeForModule(mainModule)).toBe('title');
      expect(isMainHudVisibleForMode(modeForModule(mainModule))).toBe(false);
    }
  });

  it('keeps active overworld and dungeon play as gameplay (HUD shown)', () => {
    for (const mainModule of [7, 9]) {
      expect(modeForModule(mainModule)).toBe('gameplay');
      expect(isMainHudVisibleForMode(modeForModule(mainModule))).toBe(true);
    }
  });
});
