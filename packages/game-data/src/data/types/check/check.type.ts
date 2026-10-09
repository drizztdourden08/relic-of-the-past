/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemGroupId, ItemId, RegionId, ScreenId, TagId } from '../ids';
import type { CheckKind } from '../../enumeration/enumeration.type';
import type { ReviewMark } from '../review';

interface CheckGameId {
  roomId?: number;
  chestIndex?: number;
  mask?: number;
  owScreen?: number;
  bufferIndex?: number;
  compare?: 'gte' | 'eq' | 'any-of';
  value?: number | number[];
  flagType?: number;
  flagMask?: number;
  roomFlag?: { roomId: number; chestIndex: number };
  itemId?: number;
  spriteType?: number;
  postGfx?: number;
  room?: number;
  owWorld?: 'light' | 'dark';
  eventBit?: number;
  shopSeam?: { roomId: number; entrance: number | null; owArea: number | null; subtype: number };
}

type ShopSlotPosition = 'Left' | 'Center' | 'Right' | 'Single';

type ShopSeamKind = 'shelf' | 'cauldron' | 'bomb';

interface CheckShop {
  shopId: string;
  slot: number;
  position: ShopSlotPosition;
  seam: ShopSeamKind;
}

type PondId = 'capacity' | 'wishing' | 'cursed';

interface CheckPond {
  pondId: PondId;
  rung: number;
  ladder?: string;
}

type BitState = 'clear' | 'set';

type PresenceCondition =
  | { progressFlag: number; state: BitState }
  | { progressIndicator3: number; state: BitState }
  | { itemId: ItemId; owned: boolean }
  | { follower: 'none' }
  | { followerEq: number }
  | { owEvent: { screen: number; mask: number }; state: BitState }
  | { roomBossDead: number; dead: boolean }
  | { progressIndicatorEq: number }
  | { progressIndicatorLt: number }
  | { darkWorld: boolean }
  | { bunny: boolean }
  | { crystalSwitchFlipped: boolean }
  | { desertStatuesMoved: boolean }
  | { and: PresenceCondition[] }
  | { or: PresenceCondition[] }
  | { not: PresenceCondition };

type Requirement =
  | { itemId: ItemId }
  | { checkId: CheckId }
  | { count: { groupId: ItemGroupId; n: number } }
  | { anyOf: readonly Requirement[] }
  | { allOf: readonly Requirement[] }
  | { impossible: true };

type EventGroup = 'story' | 'dungeon' | 'held' | 'fairy' | 'area' | 'combined' | 'status';

interface CheckRecord {
  id: CheckId;
  gameId: CheckGameId;
  kind: CheckKind;
  screenId?: ScreenId;
  regionId?: RegionId;
  dungeonId?: DungeonId;
  subArea?: string;
  name: string;
  vanillaItemIds: ItemId[];
  scope?: 'npc' | 'world-item' | 'key-drop' | 'capacity' | 'fixed';
  price?: number;
  shop?: CheckShop;
  pond?: CheckPond;
  isGuaranteedReward?: boolean;
  tags?: readonly TagId[];
  actorId?: ActorId;
  requirements?: Requirement;
  presence?: PresenceCondition;
  visualNote?: string;
  sourceFunc?: string;
  derived?: Requirement;
  reachAny?: readonly ScreenId[];
  fallback?: Requirement;
  now?: PresenceCondition;
  statusOnly?: true;
  eventGroup?: EventGroup;
  derivedDungeon?: { dungeonId: DungeonId; kinds?: readonly CheckKind[]; tag?: string };
  review?: ReviewMark;
}

export type {
  BitState, CheckGameId, CheckKind, CheckPond, CheckRecord, CheckShop, EventGroup, PondId,
  PresenceCondition, Requirement, ShopSeamKind, ShopSlotPosition,
};
