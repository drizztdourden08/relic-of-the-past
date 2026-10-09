/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import type { CapacityKind } from '../cheats.type';
import { CAPACITY_KIND, OUTSIDE_GATE_RUNG } from '../cheats.constants';

const cheatCapacityRung = (kind: CapacityKind): number => {
  const mod = getModule();
  if (!mod) return OUTSIDE_GATE_RUNG;
  try {
    return mod.ccall('WasmCheatCapacityRung', 'number', ['number'], [CAPACITY_KIND[kind]]) as number;
  } catch {
    return OUTSIDE_GATE_RUNG;
  }
};

export { cheatCapacityRung };
