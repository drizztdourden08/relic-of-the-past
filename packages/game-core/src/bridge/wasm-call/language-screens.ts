/* @layer bridge-wasm @kind logic */
import type { ScreenTable } from '@rotp/asset-extraction';
import { TILEMAP_FONT_ID } from '@rotp/asset-extraction';
import { cTableIdOf } from '../../language-screens/c-table-id';
import type { EmscriptenModule } from '../../types';
import { pushScreenTable } from './push-screen-table';

const pushLanguageScreens = (mod: EmscriptenModule, tables: readonly ScreenTable[]): number[] => {
  mod.ccall('WasmClearLanguageScreens', null, [], []);
  const refused: number[] = [];
  for (const table of tables) {
    if (table.id === TILEMAP_FONT_ID) {
      mod.ccall('WasmSetLanguageTilemapFont', null, ['number'], [table.bytes[0] ?? 0]);
      continue;
    }
    const cId = cTableIdOf(table.id);
    if (cId !== null && table.bytes.length > 0 && !pushScreenTable(mod, cId, table.bytes)) refused.push(table.id);
  }
  mod.ccall('WasmApplyLanguageScreens', null, [], []);
  return refused;
};

export { pushLanguageScreens };
