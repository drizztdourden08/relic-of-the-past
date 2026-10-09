/* @layer shared-game @kind types */
import type { CheckId } from '@shared/game/data/types/ids';

type SlotKey = `slot-${string}`;

type ShelfSide = 'left' | 'center' | 'right';

type ShopLocationKey = `${string}-shelf_${ShelfSide}-slot_${number}`;

type LocationKey = CheckId | SlotKey | ShopLocationKey;

export type { LocationKey, ShelfSide, ShopLocationKey, SlotKey };
