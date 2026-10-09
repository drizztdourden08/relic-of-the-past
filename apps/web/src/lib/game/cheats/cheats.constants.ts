/* @layer bridge-wasm @kind constants */
import type { CapacityKind, CheatCategory, DungeonItemKind } from './cheats.type';

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

const CheatSlot = {
  Gloves: 20, Boots: 21, Flippers: 22, MoonPearl: 23, Sword: 24, Shield: 25, Armor: 26,
  Pendants: 27, Crystals: 28, HeartPieces: 29,
} as const;

const GATE_WORD_CHEATS = 3;
const GATE_CHEATS_ENABLED = 1;
const CATEGORY_GATE_BIT: Record<CheatCategory, number> = { collision: 2, items: 4, stats: 8, combat: 16 };
const GATE_WORD_UNREADABLE = 0;

const DUNGEON_ITEM_KIND: Record<DungeonItemKind, number> = { bigKey: 1, map: 2, compass: 3 };

const CAPACITY_KIND: Record<CapacityKind, number> = { bombs: 0, arrows: 1, magic: 2, wallet: 3 };
const WALLET_CEILING_RUNG = 100;
const OUTSIDE_GATE_RUNG = -1;

const MIN_DAMAGE_MULTIPLIER = 1;
const MAX_DAMAGE_MULTIPLIER = 255;
const MIN_EXTRA_ARMOR_PCT = 0;
const MAX_EXTRA_ARMOR_PCT = 100;

const DEFAULT_TRACE_FRAMES = 120;

export {
  BottleContents, CheatSlot,
  GATE_WORD_CHEATS, GATE_CHEATS_ENABLED, CATEGORY_GATE_BIT, GATE_WORD_UNREADABLE,
  DUNGEON_ITEM_KIND, CAPACITY_KIND, WALLET_CEILING_RUNG, OUTSIDE_GATE_RUNG,
  MIN_DAMAGE_MULTIPLIER, MAX_DAMAGE_MULTIPLIER, MIN_EXTRA_ARMOR_PCT, MAX_EXTRA_ARMOR_PCT,
  DEFAULT_TRACE_FRAMES,
};
