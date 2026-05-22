/**
 * Cheats Bridge — typed wrappers for all WasmCheat* exports.
 * Calls into the running WASM module via ccall.
 */

import { getModule, getGameState } from './wasm-bridge';
import { enqueue } from './delivery-queue';
import type { DeliveryAction } from './delivery-queue';
import { ITEM_ID_TO_NAME } from '@shared/game/items';

// Expose trace helper on window for dev-console debugging
if (typeof window !== 'undefined') {
  (window as any).__trace = (frames = 120) => {
    const mod = getModule();
    if (!mod) { console.warn('WASM not loaded'); return; }
    mod.ccall('WasmCheatStartTrace', null, ['number'], [frames]);
    console.log(`[Trace] Recording ${frames} frames — check console for [TRACE] output`);
  };
}

/** Bottle slot contents (values stored in link_bottle_info[0..3]) */
export const BottleContents = {
  Empty: 0x02,
  RedPotion: 0x03,
  GreenPotion: 0x04,
  BluePotion: 0x05,
  Fairy: 0x06,
  Bee: 0x07,
  GoodBee: 0x08,
} as const;
export type BottleContentsValue = (typeof BottleContents)[keyof typeof BottleContents];

function isReady(): boolean {
  return getGameState().status === 'running' && getModule() != null;
}

function ccall(fn: string, args: number[]): void {
  const mod = getModule();
  if (!mod) return;
  mod.ccall(fn, null, args.map(() => 'number'), args);
}

// ─── Item Giving (routed through delivery queue) ───

/** Give item by ID with hold-up animation. Queued until Link can receive. */
export function cheatGiveItem(itemId: number): void {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'give_item', itemId };
  const name = ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  enqueue(name, 'cheat', action);
}

/**
 * Trigger a chest-type check: sets room flag, plays animation, marks as completed.
 * Queued until Link can receive.
 */
export function cheatTriggerCheck(roomId: number, chestIndex: number, itemId: number): void {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const name = ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  enqueue(name, 'cheat', action);
}

/**
 * Trigger an NPC-type check: sets progress flags, gives item with animation.
 * Queued until Link can receive.
 */
export function cheatTriggerNpcCheck(
  flagType: number, flagMask: number, itemId: number,
  spriteType: number, postGfx: number
): void {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx };
  const name = ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  enqueue(name, 'cheat', action);
}

// ─── Stats ───

/** Set Link's current health. Each heart = 8 units. */
export function cheatSetHealth(value: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetHealth', [value]);
}

/** Set Link's max health capacity. Each heart = 8 units. Max 20 hearts (160). */
export function cheatSetMaxHealth(value: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetMaxHealth', [value]);
}

/** Set rupee goal (game animates counter toward target). Max 999. */
export function cheatSetRupees(amount: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetRupees', [amount]);
}

/** Set bomb count. Max 99. */
export function cheatSetBombs(count: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetBombs', [count]);
}

/** Set arrow count. Max 99. */
export function cheatSetArrows(count: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetArrows', [count]);
}

/** Refill magic to full. */
export function cheatRefillMagic(): void {
  if (!isReady()) return;
  ccall('WasmCheatRefillMagic', []);
}

// ─── Bottles ───

/** Fill a bottle slot (0-3) with specified contents. */
export function cheatFillBottle(slot: 0 | 1 | 2 | 3, contents: BottleContentsValue): void {
  if (!isReady()) return;
  ccall('WasmCheatFillBottle', [slot, contents]);
}

// ─── Combat ───

/** Kill all hostile enemies on screen. */
export function cheatKillAllEnemies(): void {
  if (!isReady()) return;
  ccall('WasmCheatKillAllEnemies', []);
}

/** Set outgoing damage multiplier (1 = normal). */
export function cheatSetDamageMultiplier(mult: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetDamageMultiplier', [Math.max(1, Math.min(255, mult))]);
}

/** Set extra armor damage reduction percentage (0-100). Stacks with equipped armor. */
export function cheatSetExtraArmorPct(pct: number): void {
  if (!isReady()) return;
  ccall('WasmCheatSetExtraArmorPct', [Math.max(0, Math.min(100, pct))]);
}

/** Start debug trace for N frames (default 120). Output goes to browser console. */
export function cheatStartTrace(frames = 120): void {
  if (!isReady()) return;
  ccall('WasmCheatStartTrace', [frames]);
}
