/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import type { CapacityKind, CapacityRung } from '../cheats.type';
import { CAPACITY_KIND, WALLET_CEILING_RUNG } from '../cheats.constants';

const cheatCapacityLadder = (kind: CapacityKind): CapacityRung[] => {
  const mod = getModule();
  if (!mod) return [];
  const out: CapacityRung[] = [];
  try {
    for (let rung = 0; rung <= WALLET_CEILING_RUNG; rung++) {
      const cap = mod.ccall('WasmCheatCapacityRungCap', 'number', ['number', 'number'], [CAPACITY_KIND[kind], rung]);
      if (cap >= 0) out.push({ rung, cap });
    }
  } catch {
    return [];
  }
  return out;
};

export { cheatCapacityLadder };
