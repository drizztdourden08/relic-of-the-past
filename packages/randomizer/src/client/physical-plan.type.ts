/* @layer bridge-wasm @kind types */
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';
import type { CheckDetection } from './check-detection';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides/scripted-grant-overrides.type';

type PlanClass = 'override' | 'override-npc' | 'override-drop' | 'override-standing'
  | 'override-scripted' | 'override-shop' | 'deliver' | 'vanilla-locked';

interface PlanNpcGrant {
  flagType: number;
  flagMask: number;
  spriteType: number;
  postGfx: number;
}

interface PlanNpcOverride {
  roomId: number | null;
  vanillaItemId: number;
  spriteType?: number;
  targetLocalId: number;
}

interface PlanStandingOverride {
  area: number;
  indoors: boolean;
  sprite: number;
  half: number;
  targetLocalId: number;
}

interface PlanScriptedOverride {
  target: ScriptedGrantSurface;
  targetLocalId: number;
}

interface PlanShopOverride {
  slotIndex: number;
  roomId: number;
  entrance: number;
  owArea: number;
  subtype: number;
  depthIndex: number;
  depth: number;
  currency: number;
  amount: number;
  targetLocalId: number;
}

interface PlanDropOverride {
  roomId: number;
  big: boolean;
  targetLocalId: number;
}

interface PlanEntry {
  location: LocationKey;
  item: ItemKey;
  checkId?: string;
  planClass: PlanClass;
  detection?: CheckDetection;
  target?: { roomId: number; chestIndex: number; targetLocalId: number };
  targetLocalId?: number;
  npcGrant?: PlanNpcGrant;
  npcOverride?: PlanNpcOverride;
  dropOverride?: PlanDropOverride;
  standingOverride?: PlanStandingOverride;
  scriptedOverride?: PlanScriptedOverride;
  shopOverride?: PlanShopOverride;
}

interface PlanError {
  location: LocationKey;
  item: ItemKey;
  reason: string;
}

interface PlanCounts {
  override: number;
  overrideNpc: number;
  overrideDrop: number;
  overrideStanding: number;
  overrideScripted: number;
  overrideShop: number;
  deliver: number;
  vanillaLocked: number;
  pollBlind: number;
  errors: number;
}

interface PhysicalPlan {
  entries: PlanEntry[];
  errors: PlanError[];
  counts: PlanCounts;
}

export type {
  PhysicalPlan, PlanClass, PlanCounts, PlanDropOverride, PlanEntry, PlanError,
  PlanNpcGrant, PlanNpcOverride, PlanScriptedOverride, PlanShopOverride, PlanStandingOverride,
};
