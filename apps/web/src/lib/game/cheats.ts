/* @layer bridge-wasm @kind logic */
/**
 * Cheats Bridge — typed wrappers for all WasmCheat* exports.
 * Calls into the running WASM module via ccall.
 */

import { getModule, getGameState } from './wasm-bridge';
import { voidCall } from './bridge/wasm-call';
import { enqueue } from './delivery-queue';
import type { DeliveryAction } from './delivery-queue';
import { getItemByGameId } from '@shared/game/data';

const itemName = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.randomizerName ?? `Unknown Item #${itemId}`;

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
const BottleContents = {
  Empty: 0x02,
  RedPotion: 0x03,
  GreenPotion: 0x04,
  BluePotion: 0x05,
  Fairy: 0x06,
  Bee: 0x07,
  GoodBee: 0x08,
} as const;
type BottleContentsValue = (typeof BottleContents)[keyof typeof BottleContents];

const isReady = (): boolean => {
  return getGameState().status === 'running' && getModule() != null;
};

/** Pack numeric args into the {argTypes, args} shape voidCall expects. */
const numArgs = (...args: number[]): { argTypes: string[]; args: unknown[] } => ({ argTypes: args.map(() => 'number'), args });

// ─── Item Giving (routed through delivery queue) ───

const cheatGiveItem = (itemId: number): void => {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'give_item', itemId };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};

const cheatTriggerCheck = (roomId: number, chestIndex: number, itemId: number): void => {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};

const cheatTriggerNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number): void => {
  if (!isReady()) return;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};

// ─── Stats ───

const cheatSetHealth = (value: number): void => voidCall('WasmCheatSetHealth', numArgs(value));

const cheatSetMaxHealth = (value: number): void => voidCall('WasmCheatSetMaxHealth', numArgs(value));

const cheatSetRupees = (amount: number): void => voidCall('WasmCheatSetRupees', numArgs(amount));

const cheatSetBombs = (count: number): void => voidCall('WasmCheatSetBombs', numArgs(count));

const cheatSetArrows = (count: number): void => voidCall('WasmCheatSetArrows', numArgs(count));

const cheatRefillMagic = (): void => voidCall('WasmCheatRefillMagic');

// ─── Bottles ───

const cheatFillBottle = (slot: 0 | 1 | 2 | 3, contents: BottleContentsValue): void =>
  voidCall('WasmCheatFillBottle', numArgs(slot, contents));

// ─── Combat ───

const cheatKillAllEnemies = (): void => voidCall('WasmCheatKillAllEnemies');

const cheatSetDamageMultiplier = (mult: number): void =>
  voidCall('WasmCheatSetDamageMultiplier', numArgs(Math.max(1, Math.min(255, mult))));

const cheatSetExtraArmorPct = (pct: number): void =>
  voidCall('WasmCheatSetExtraArmorPct', numArgs(Math.max(0, Math.min(100, pct))));

const cheatStartTrace = (frames = 120): void => voidCall('WasmCheatStartTrace', numArgs(frames));

export { BottleContents, cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck, cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows, cheatRefillMagic, cheatFillBottle, cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct, cheatStartTrace };
export type { BottleContentsValue };
