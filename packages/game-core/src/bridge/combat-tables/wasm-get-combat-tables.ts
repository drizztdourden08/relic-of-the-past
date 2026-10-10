/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';
import { ANCILLA_DAMAGE_SIZE, FILLED, PROJECTILE_COLLISION_SIZE } from './combat-tables.constants';
import type { CombatTables } from './combat-tables.type';

const wasmGetCombatTables = (): CombatTables | null =>
  callWhenRunning<CombatTables | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetCombatTables', 'number', [], []);
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    if (heap[ptr] !== FILLED) return null;
    const base = ptr + 1;
    const ancillaDamageClass = Array.from(heap.subarray(base, base + ANCILLA_DAMAGE_SIZE));
    const projectileTileCollision = Array.from(
      heap.subarray(base + ANCILLA_DAMAGE_SIZE, base + ANCILLA_DAMAGE_SIZE + PROJECTILE_COLLISION_SIZE),
    );
    return { ancillaDamageClass, projectileTileCollision };
  });

export { wasmGetCombatTables };
