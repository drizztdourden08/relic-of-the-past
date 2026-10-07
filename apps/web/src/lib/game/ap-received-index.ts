/* @layer bridge-wasm @kind logic */
/**
 * The multiworld received-item index kept in the save (2 bytes, so it travels with save
 * states and SRAM). Guarded: a core built before the export existed answers null, and the
 * caller falls back to a value of its own.
 */
import { getModule } from './wasm-bridge';

const GET_EXPORT = 'WasmGetApReceivedIndex';
const SET_EXPORT = 'WasmSetApReceivedIndex';

const hasExport = (name: string): boolean => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  return mod != null && typeof mod[`_${name}`] === 'function';
};

/** The saved index, or null when the core has no such export (or is not loaded). */
const getApReceivedIndex = (): number | null => {
  const mod = getModule();
  if (!mod || !hasExport(GET_EXPORT)) return null;
  try {
    return mod.ccall(GET_EXPORT, 'number', [], []) as number;
  } catch {
    return null;
  }
};

/** Writes the index; false when the core cannot hold it. */
const setApReceivedIndex = (index: number): boolean => {
  const mod = getModule();
  if (!mod || !hasExport(SET_EXPORT)) return false;
  try {
    mod.ccall(SET_EXPORT, null, ['number'], [index]);
    return true;
  } catch {
    return false;
  }
};

export { getApReceivedIndex, setApReceivedIndex };
