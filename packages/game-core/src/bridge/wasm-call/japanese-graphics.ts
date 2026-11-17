/* @layer bridge-wasm @kind logic */
import type { ScreenTable } from '@rotp/asset-extraction';
import type { EmscriptenModule } from '../../types';

const pushOne = (mod: EmscriptenModule, table: ScreenTable): boolean => {
  const ptr = mod.ccall('malloc', 'number', ['number'], [table.bytes.length]);
  if (ptr === 0) return false;
  mod.HEAPU8.set(table.bytes, ptr);
  const taken = mod.ccall('WasmSetJapaneseGraphic', 'number', ['number', 'number', 'number'], [table.id, ptr, table.bytes.length]);
  mod.ccall('free', null, ['number'], [ptr]);
  return taken === 1;
};

const pushJapaneseGraphics = (mod: EmscriptenModule, tables: readonly ScreenTable[]): number[] => {
  mod.ccall('WasmClearJapaneseGraphics', null, [], []);
  return tables.filter((table) => table.bytes.length > 0 && !pushOne(mod, table)).map((table) => table.id);
};

export { pushJapaneseGraphics };
