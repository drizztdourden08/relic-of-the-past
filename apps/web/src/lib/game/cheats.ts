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

/** Bottle slot contents (values stored in link_bottle_info[0..3]). None means no bottle in the slot. */
const BottleContents = {
  None: 0x00,
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

// Gate word 3 holds the cheat gates: bit 1 is the master, the rest one category each.
// Mirrors kFeatures3_* in core/zelda3/src/features.h.
const GATE_WORD_CHEATS = 3;
const GATE_CHEATS_ENABLED = 1;

/** The four cheat categories, one gate bit each under the master switch. */
type CheatCategory = 'collision' | 'items' | 'stats' | 'combat';

const CATEGORY_GATE_BIT: Record<CheatCategory, number> = { collision: 2, items: 4, stats: 8, combat: 16 };

/**
 * Read the gate word in effect on the core's WRAM (WasmGetEffectiveGateWord), not the last
 * request (WasmGetGateWord), which disagrees once Vanilla Safe masks bits off. Before the first
 * simulated frame this reads 0, which correctly refuses everything.
 */
const readEffectiveCheatWord = (): number => {
  const mod = getModule();
  if (!mod) return 0;
  try {
    return mod.ccall('WasmGetEffectiveGateWord', 'number', ['number'], [GATE_WORD_CHEATS]) as number;
  } catch {
    return 0; // older core without the export: refuse, don't queue undeliverable work
  }
};

/** Whether the master switch and one category's bit are both set in the effective word. */
const cheatCategoryAllowed = (category: CheatCategory): boolean => {
  const word = readEffectiveCheatWord();
  return (word & GATE_CHEATS_ENABLED) !== 0 && (word & CATEGORY_GATE_BIT[category]) !== 0;
};

// A gated-off grant is refused HERE, not queued: the queue would accept work the core silently drops.
const itemGrantAllowed = (): boolean => cheatCategoryAllowed('items');

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

/** Whether a cheat grant is permitted right now: the game is running and both gate bits are set. */
const cheatItemGrantAllowed = (): boolean => isReady() && itemGrantAllowed();

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

// Any contents byte, None included: the core keeps the bottle index in step with what is held.
const cheatSetBottle = (slot: 0 | 1 | 2 | 3, contents: BottleContentsValue): void =>
  voidCall('WasmCheatSetBottle', numArgs(slot, contents));

// ─── Inventory writes (cheat_inventory.c) ───

/**
 * Console slot numbers for a direct inventory write: 0-19 are the pause menu's save order
 * (15 is the bottle index), then the passives, the gear tiers and the three progress bytes.
 * Mirrors cheat_inventory.h.
 */
const CheatSlot = {
  Gloves: 20, Boots: 21, Flippers: 22, MoonPearl: 23, Sword: 24, Shield: 25, Armor: 26,
  Pendants: 27, Crystals: 28, HeartPieces: 29,
} as const;

/** Write one inventory byte: the remove, downgrade and "exactly this tier" path. A give uses deliverItem. */
const cheatSetInventorySlot = (slot: number, value: number): void =>
  voidCall('WasmCheatSetInventorySlot', numArgs(slot, value));

/** The live small-key count. The core refuses it outside a dungeon. */
const cheatSetSmallKeys = (count: number): void => voidCall('WasmCheatSetSmallKeys', numArgs(count));

/** The three dungeon-item bit families, in the core's kind order. */
type DungeonItemKind = 'bigKey' | 'map' | 'compass';
const DUNGEON_ITEM_KIND: Record<DungeonItemKind, number> = { bigKey: 1, map: 2, compass: 3 };

/** Toggle a dungeon's big key, map or compass. `palaceIndexX2` is the doubled index the UI store carries. */
const cheatSetDungeonItem = (kind: DungeonItemKind, palaceIndexX2: number, on: boolean): void =>
  voidCall('WasmCheatSetDungeonItem', numArgs(DUNGEON_ITEM_KIND[kind], palaceIndexX2, on ? 1 : 0));

// ─── Capacity ladders (cheat_capacity.c) ───

/** The four capacity families, in the core's family order. */
type CapacityKind = 'bombs' | 'arrows' | 'magic' | 'wallet';
const CAPACITY_KIND: Record<CapacityKind, number> = { bombs: 0, arrows: 1, magic: 2, wallet: 3 };

/** One rung of a ladder: its index and the cap read on it (the meter: a level code, 0 none, 1 full, 2 half, 3 quarter). */
type CapacityRung = { rung: number; cap: number };

/** The wallet ladder is the longest: rung 100 is the 9999 ceiling. */
const CAPACITY_RUNG_LAST = 100;

/**
 * Every rung the current mode offers for a family: a vanilla file offers the native grid, a
 * randomized file under a capacity profile that profile's ladder. Empty outside the gate.
 */
const cheatCapacityLadder = (kind: CapacityKind): CapacityRung[] => {
  const mod = getModule();
  if (!mod) return [];
  const out: CapacityRung[] = [];
  try {
    for (let rung = 0; rung <= CAPACITY_RUNG_LAST; rung++) {
      const cap = mod.ccall('WasmCheatCapacityRungCap', 'number', ['number', 'number'], [CAPACITY_KIND[kind], rung]) as number;
      if (cap >= 0) out.push({ rung, cap });
    }
  } catch {
    return [];
  }
  return out;
};

/** The rung a family stands on, or -1 outside the gate. */
const cheatCapacityRung = (kind: CapacityKind): number => {
  const mod = getModule();
  if (!mod) return -1;
  try {
    return mod.ccall('WasmCheatCapacityRung', 'number', ['number'], [CAPACITY_KIND[kind]]) as number;
  } catch {
    return -1;
  }
};

/** Land a family on a rung of the offered ladder; the core trims what it holds to the new cap. */
const cheatSetCapacityRung = (kind: CapacityKind, rung: number): void =>
  voidCall('WasmCheatSetCapacityRung', numArgs(CAPACITY_KIND[kind], rung));


// Tracked locally (not read back from WASM) so the Cheats widget's toggle and the
// cheat-ignore-collision keybind can agree on the current state without either one polling the
// module every render.
let ignoreCollisionEnabled = false;

const cheatSetIgnoreCollision = (on: boolean): void => {
  ignoreCollisionEnabled = on;
  voidCall('WasmCheatSetIgnoreCollision', numArgs(on ? 1 : 0));
};

const getIgnoreCollisionEnabled = (): boolean => ignoreCollisionEnabled;

// ─── Movement recovery ───

/** Force-clears a stuck immobilize/handler/submodule state. See WasmCheatUnblockLink (cheats.c). */
const cheatUnblockLink = (): void => voidCall('WasmCheatUnblockLink');

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

// Held here for the same reason as the collision flag: the widget reads these back after a
// remount instead of guessing, and the core keeps no read export for them.
let damageMultiplier = 1;
let extraArmorPct = 0;

const cheatSetDamageMultiplier = (mult: number): void => {
  damageMultiplier = Math.max(1, Math.min(255, mult));
  voidCall('WasmCheatSetDamageMultiplier', numArgs(damageMultiplier));
};

const getDamageMultiplier = (): number => damageMultiplier;

const cheatSetExtraArmorPct = (pct: number): void => {
  extraArmorPct = Math.max(0, Math.min(100, pct));
  voidCall('WasmCheatSetExtraArmorPct', numArgs(extraArmorPct));
};

const getExtraArmorPct = (): number => extraArmorPct;

const cheatStartTrace = (frames = 120): void => voidCall('WasmCheatStartTrace', numArgs(frames));

export {
  BottleContents, CheatSlot, cheatCategoryAllowed, cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck,
  cheatItemGrantAllowed, cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows,
  cheatSetMaxBombs, cheatSetMaxArrows, cheatSetMaxWallet, cheatSetMagic, cheatRefillMagic, cheatSetBottle,
  cheatSetInventorySlot, cheatSetSmallKeys, cheatSetDungeonItem, cheatCapacityLadder, cheatCapacityRung,
  cheatSetCapacityRung, cheatSetIgnoreCollision,
  getIgnoreCollisionEnabled, cheatUnblockLink, cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled,
  cheatKillAllEnemies, cheatSetDamageMultiplier, getDamageMultiplier, cheatSetExtraArmorPct, getExtraArmorPct,
  cheatStartTrace,
};
export type { BottleContentsValue, CapacityKind, CapacityRung, CheatCategory, DungeonItemKind };
