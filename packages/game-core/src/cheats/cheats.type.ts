/* @layer bridge-wasm @kind types */
import type { BottleContents } from './cheats.constants';

type BottleContentsValue = (typeof BottleContents)[keyof typeof BottleContents];

type BottleSlot = 0 | 1 | 2 | 3;

type CheatCategory = 'collision' | 'items' | 'stats' | 'combat';

type DungeonItemKind = 'bigKey' | 'map' | 'compass';

type CapacityKind = 'bombs' | 'arrows' | 'magic' | 'wallet';

type CapacityRung = { rung: number; cap: number };

export type { BottleContentsValue, BottleSlot, CapacityKind, CapacityRung, CheatCategory, DungeonItemKind };
