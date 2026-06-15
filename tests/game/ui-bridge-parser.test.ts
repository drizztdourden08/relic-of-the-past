/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import type { UIMode } from '@shared/game/types';
import { parseGameUIBuffer } from '../../apps/web/src/lib/game/ui-bridge-parser';
import { isMainHudVisibleForMode } from '../../apps/web/src/ui/domains/hud/hud-visibility';

// The buffer is read up to byte 124; a fresh zeroed array is enough since only
// the main-module byte (offset 0) drives the mode for these cases.
const modeForModule = (mainModule: number): UIMode => {
  const buffer = new Uint8Array(128);
  buffer[0] = mainModule;
  return parseGameUIBuffer(buffer, 0).mode;
};

describe('deriveUIMode (via parseGameUIBuffer)', () => {
  it('maps the intro attract demo and file-select menus to title (HUD hidden)', () => {
    // Module14_Attract (20) is the intro "video"; 2-4 are the file copy/erase/
    // name submenus. None are gameplay — the main HUD must not leak into them.
    for (const mainModule of [0, 1, 2, 3, 4, 20]) {
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
