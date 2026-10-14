/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondAskAmountKind, PondAskCurrency, PondAskSetting } from './pond-ask.type';
import type { PondInstance, PondSlot, PondSlotLock } from './pond-instance.type';
import type { PondCustomSetting, PondPlan, PondSetting } from './pond-profile.type';
import type { PondProfiles } from './pond-profiles.type';

type PondCeilings = Readonly<Record<PondAskCurrency, number>>;

interface PondAskRange {
  stops: readonly number[];
  min: number;
  max: number;
  ceiling: number;
}

interface AskRange {
  min: number;
  max: number;
}

type RupeeEnds = AskRange;

interface ParsedPondSetting {
  setting: PondSetting;
  notes: readonly string[];
}

interface ParsedPondProfiles {
  profiles: PondProfiles;
  stored: PondProfiles;
  shared: boolean;
  notes: readonly string[];
}

interface HeldPondSetting {
  setting: PondSetting;
  notes: readonly string[];
}

interface PondVanillaSlots {
  locked: ReadonlyMap<LocationKey, ItemKey>;
  pairAsPrizes: readonly LocationKey[];
}

type GrantingSlot = PondSlot & { vanillaGrant: ItemId };

interface PondSlotModel {
  lock: PondSlotLock;
  vanillaGrant?: ItemId;
}

interface PondAskRow {
  currency: PondAskAmountKind;
  label: string;
  stops: readonly number[];
  defaultMin: number;
  defaultMax: number;
}

type PondCurrencyRow = PondAskRow & { currency: PondAskCurrency };

interface RupeeDenomination {
  value: number;
  itemId: ItemId;
  colour: string;
  decodeKey: number;
}

interface AskingPond {
  pond: PondInstance;
  setting: PondCustomSetting;
}

interface PondDemandInput {
  seed: string;
  ponds: PondProfiles;
  capacity: CapacityProfile;
  itemPool: () => readonly ItemKey[];
}

type DemandKind = PondAskAmountKind | 'item';

interface DemandContext {
  ask: PondAskSetting;
  plan: PondPlan;
  capacity: CapacityProfile;
}

type PondField = 'mode' | 'throws' | 'items' | 'curve' | 'jumps';

type ActivePondSetting = Exclude<PondSetting, { mode: 'capacity' }>;

interface PondSchedule {
  prices: number[];
  prizeAt: Map<number, number>;
}

export type {
  ActivePondSetting, AskingPond, AskRange, DemandContext, DemandKind, GrantingSlot, HeldPondSetting, ParsedPondProfiles,
  ParsedPondSetting, PondAskRange, PondAskRow, PondCeilings, PondCurrencyRow, PondDemandInput,
  PondField, PondSchedule, PondSlotModel, PondVanillaSlots, RupeeDenomination, RupeeEnds,
};
