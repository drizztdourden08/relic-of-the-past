/* @layer bridge-wasm @kind logic */
/** Resolved per-sprite-type damage rows and the shared ancilla damage-class / projectile-collision tables. */
import { callWhenRunning } from './wasm-call';

interface SpriteCombatInfo {
  health: number;
  flags4: number;
  damageByClass: number[];
}

interface CombatTables {
  ancillaDamageClass: number[];
  projectileTileCollision: number[];
}

const ANCILLA_DAMAGE_SIZE = 57;
const PROJECTILE_COLLISION_SIZE = 256;
/** Both buffers open with 1 when the row that follows was filled, 0 when the
 *  developer-tools gate is off or the query was out of range. A zero row is a
 *  legitimate answer, so this is the only thing that can tell the two apart. */
const FILLED = 1;

/**
 * Get the resolved combat row for one sprite type: initial health, initial
 * flags4, and the 16-entry damage-by-class table already reduced through the
 * game's own two-step lookup. Returns `null` when developer tools are off or
 * `spriteType` is out of the table's range.
 */
const wasmGetSpriteCombat = (spriteType: number): SpriteCombatInfo | null =>
  callWhenRunning<SpriteCombatInfo | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetSpriteCombat', 'number', ['number'], [spriteType]) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    if (heap[ptr] !== FILLED) return null;
    const damageByClass: number[] = [];
    for (let i = 0; i < 16; i++) damageByClass.push(heap[ptr + 3 + i]);
    return { health: heap[ptr + 1], flags4: heap[ptr + 2], damageByClass };
  });

/**
 * Get the shared combat tables: ancilla (projectile) type -> damage class, and
 * tile attribute -> projectile collision behavior (0 pass, 1 block, 2 sloped,
 * 3 layer-dependent, 4 priority flip). Returns `null` when developer tools are off.
 */
const wasmGetCombatTables = (): CombatTables | null =>
  callWhenRunning<CombatTables | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetCombatTables', 'number', [], []) as number;
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

export { wasmGetSpriteCombat, wasmGetCombatTables };
export type { SpriteCombatInfo, CombatTables };
