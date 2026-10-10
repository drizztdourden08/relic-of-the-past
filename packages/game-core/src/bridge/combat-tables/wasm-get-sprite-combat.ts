/* @layer bridge-wasm @kind logic */
import { readU8, callWhenRunning } from '../wasm-call';
import { DAMAGE_CLASS_COUNT, DAMAGE_ROW_OFFSET, FILLED } from './combat-tables.constants';
import type { SpriteCombatInfo } from './combat-tables.type';

const wasmGetSpriteCombat = (spriteType: number): SpriteCombatInfo | null =>
  callWhenRunning<SpriteCombatInfo | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetSpriteCombat', 'number', ['number'], [spriteType]);
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    if (heap[ptr] !== FILLED) return null;
    const damageByClass: number[] = [];
    for (let i = 0; i < DAMAGE_CLASS_COUNT; i++) damageByClass.push(readU8(heap, ptr + DAMAGE_ROW_OFFSET + i));
    return { health: readU8(heap, ptr + 1), flags4: readU8(heap, ptr + 2), damageByClass };
  });

export { wasmGetSpriteCombat };
