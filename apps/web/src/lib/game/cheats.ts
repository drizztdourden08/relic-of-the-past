/* @layer bridge-wasm @kind logic */

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
    console.log(`[Trace] Recording ${frames} frames. Check console for [TRACE] output`);
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

// Gate word 3 holds the cheat gates; bit 1 is the master and bit 4 the item-grant category.
// Mirrors kFeatures3_* in core/zelda3/src/features.h.
const GATE_WORD_CHEATS = 3;
const GATE_CHEATS_ENABLED = 1;
const GATE_CHEAT_ITEM_GRANT = 4;

/**
 * Read the gate word in effect on the core's WRAM (WasmGetEffectiveGateWord), not the last
 * request (WasmGetGateWord), which disagrees once Vanilla Safe masks bits off. Before the first
 * simulated frame this reads 0, which correctly refuses the grant. A gated-off grant is refused
 * HERE, not queued: the queue would accept work the core silently drops.
 */
const itemGrantAllowed = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  try {
    const word = mod.ccall('WasmGetEffectiveGateWord', 'number', ['number'], [GATE_WORD_CHEATS]) as number;
    return (word & GATE_CHEATS_ENABLED) !== 0 && (word & GATE_CHEAT_ITEM_GRANT) !== 0;
  } catch {
    return false; // older core without the export: refuse, don't queue undeliverable work
  }
};

// Item giving, routed through the delivery queue.

const cheatGiveItem = (itemId: number): void => {
  if (!isReady() || !itemGrantAllowed()) return;
  const action: DeliveryAction = { type: 'give_item', itemId };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};

const cheatTriggerCheck = (roomId: number, chestIndex: number, itemId: number): void => {
  if (!isReady() || !itemGrantAllowed()) return;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};

const cheatTriggerNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number): void => {
  if (!isReady() || !itemGrantAllowed()) return;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx };
  const name = itemName(itemId);
  enqueue(name, 'cheat', action);
};


const cheatSetHealth = (value: number): void => voidCall('WasmCheatSetHealth', numArgs(value));

const cheatSetMaxHealth = (value: number): void => voidCall('WasmCheatSetMaxHealth', numArgs(value));

const cheatSetRupees = (amount: number): void => voidCall('WasmCheatSetRupees', numArgs(amount));

const cheatSetBombs = (count: number): void => voidCall('WasmCheatSetBombs', numArgs(count));

const cheatSetArrows = (count: number): void => voidCall('WasmCheatSetArrows', numArgs(count));

const cheatSetMagic = (value: number): void => voidCall('WasmCheatSetMagic', numArgs(value));

const cheatRefillMagic = (): void => voidCall('WasmCheatRefillMagic');

// Capacity setters take a wanted count, not the tier index the core stores. It snaps to the
// nearest legal upgrade tier, so a percentage of MAGIC_FULL/BOMB_CAPACITY_MAX is a valid argument.
const cheatSetMaxBombs = (capacity: number): void => voidCall('WasmCheatSetMaxBombs', numArgs(capacity));

const cheatSetMaxArrows = (capacity: number): void => voidCall('WasmCheatSetMaxArrows', numArgs(capacity));

// The wallet has no native tiers: the core lands the wanted ceiling on the nearest rung of the
// hook-owned ladder (0, 99, 199 ... 9999) and refuses when no Custom wallet is armed, since the
// native ceiling is a feature setting, not a cheat.
const cheatSetMaxWallet = (capacity: number): void => voidCall('WasmCheatSetMaxWallet', numArgs(capacity));

// ─── Bottles ───

const cheatFillBottle = (slot: 0 | 1 | 2 | 3, contents: BottleContentsValue): void =>
  voidCall('WasmCheatFillBottle', numArgs(slot, contents));


// Tracked locally (not read back from WASM) so the Cheats widget's toggle and the
// cheat-ignore-collision keybind can agree on the current state without either one polling the
// module every render.
let ignoreCollisionEnabled = false;

const cheatSetIgnoreCollision = (on: boolean): void => {
  ignoreCollisionEnabled = on;
  voidCall('WasmCheatSetIgnoreCollision', numArgs(on ? 1 : 0));
};

const getIgnoreCollisionEnabled = (): boolean => ignoreCollisionEnabled;

// ─── Lighting ───

// Same local-state reasoning as ignore-collision above: the widget's toggle reads this instead of
// polling the module. The core applies it on the next frame boundary, not at this call.
let illuminateDarkRoomsEnabled = false;

const cheatSetIlluminateDarkRooms = (on: boolean): void => {
  illuminateDarkRoomsEnabled = on;
  voidCall('WasmCheatSetIlluminateDarkRooms', numArgs(on ? 1 : 0));
};

const getIlluminateDarkRoomsEnabled = (): boolean => illuminateDarkRoomsEnabled;

// ─── Combat ───

const cheatKillAllEnemies = (): void => voidCall('WasmCheatKillAllEnemies');

const cheatSetDamageMultiplier = (mult: number): void =>
  voidCall('WasmCheatSetDamageMultiplier', numArgs(Math.max(1, Math.min(255, mult))));

const cheatSetExtraArmorPct = (pct: number): void =>
  voidCall('WasmCheatSetExtraArmorPct', numArgs(Math.max(0, Math.min(100, pct))));

const cheatStartTrace = (frames = 120): void => voidCall('WasmCheatStartTrace', numArgs(frames));

export { BottleContents, cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck, cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows, cheatSetMaxBombs, cheatSetMaxArrows, cheatSetMaxWallet, cheatSetMagic, cheatRefillMagic, cheatFillBottle, cheatSetIgnoreCollision, getIgnoreCollisionEnabled, cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled, cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct, cheatStartTrace };
export type { BottleContentsValue };
