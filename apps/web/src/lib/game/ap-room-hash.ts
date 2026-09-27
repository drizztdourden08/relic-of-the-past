/* @layer bridge-wasm @kind logic */
/**
 * The multiworld room a file belongs to, kept in the save (4 bytes, ap_room_hash.c), so it
 * travels with save states and SRAM. Guarded: a core built before the export existed reads 0
 * (no room yet) and ignores a write.
 */
import { getModule } from './wasm-bridge';

const GET_EXPORT = 'WasmGetApRoomHash';
const SET_EXPORT = 'WasmSetApRoomHash';

const hasExport = (name: string): boolean => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  return mod != null && typeof mod[`_${name}`] === 'function';
};

/** The saved room hash as an unsigned 32-bit number; 0 when none is saved or the core cannot say. */
const getApRoomHash = (): number => {
  const mod = getModule();
  if (!mod || !hasExport(GET_EXPORT)) return 0;
  try {
    return (mod.ccall(GET_EXPORT, 'number', [], []) as number) >>> 0;
  } catch {
    return 0;
  }
};

const setApRoomHash = (hash: number): void => {
  const mod = getModule();
  if (!mod || !hasExport(SET_EXPORT)) return;
  try {
    mod.ccall(SET_EXPORT, null, ['number'], [hash | 0]);
  } catch { /* an older core keeps no room */ }
};

export { getApRoomHash, setApRoomHash };
