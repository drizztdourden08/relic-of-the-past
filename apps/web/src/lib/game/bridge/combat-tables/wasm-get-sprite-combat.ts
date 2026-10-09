/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';
import { DAMAGE_CLASS_COUNT, DAMAGE_ROW_OFFSET, FILLED } from './combat-tables.constants';
import type { SpriteCombatInfo } from './combat-tables.type';

const wasmGetSpriteCombat = (spriteType: number): SpriteCombatInfo | null =>
  callWhenRunning<SpriteCombatInfo | null>(null, (mod) => {
    const ptr = mod.ccall('WasmGetSpriteCombat', 'number', ['number'], [spriteType]) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    if (heap[ptr] !== FILLED) return null;
    const damageByClass: number[] = [];
    for (let i = 0; i < DAMAGE_CLASS_COUNT; i++) damageByClass.push(heap[ptr + DAMAGE_ROW_OFFSET + i]);
    return { health: heap[ptr + 1], flags4: heap[ptr + 2], damageByClass };
  });

export { wasmGetSpriteCombat };
