/* @layer bridge-wasm @kind types */
/**
 * The physical plan: the bridge's answer to "what does this placement mean
 * in the running game". Every planned location falls in exactly one class:
 * an in-core chest override, an in-core scripted-grant (npc) override, a
 * poll-and-deliver grant, or a generation-locked vanilla location (no
 * physical action, still reported). A non-locked location with no physical
 * path is a plan ERROR, never a silent skip, so a session must refuse to start
 * on any.
 */
import type { CheckDetection } from './check-detection';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides';

type PlanClass = 'override' | 'override-npc' | 'override-drop' | 'override-standing'
  | 'override-scripted' | 'override-shop' | 'deliver' | 'vanilla-locked';

/** NPC grant parameters forwarded to the delivery queue's npc trigger. */
interface PlanNpcGrant {
  flagType: number;
  flagMask: number;
  spriteType: number;
  postGfx: number;
}

/** In-core scripted-grant substitution target, present exactly for 'override-npc'. */
interface PlanNpcOverride {
  /** The giver's indoor room index, or null to match by item or sprite. */
  roomId: number | null;
  /** The native receive id the giver's own script grants. */
  vanillaItemId: number;
  /** Sprite-keyed entries only: the certified giver's sprite type. */
  spriteType?: number;
  targetLocalId: number;
}

/** In-core standing-prize substitution target, present exactly for 'override-standing'. */
interface PlanStandingOverride {
  /** Overworld screen index (outdoor) or room index (indoor). */
  area: number;
  indoors: boolean;
  /** The standing prize's sprite type. */
  sprite: number;
  /** Indoor room half the prize stands in: 0 = left, 1 = right, 2 = either. */
  half: number;
  targetLocalId: number;
}

/** In-core scripted-grant slot, present exactly for 'override-scripted'. */
interface PlanScriptedOverride {
  target: ScriptedGrantSurface;
  targetLocalId: number;
}

/** In-core shelf-slot substitution target, present exactly for 'override-shop'. */
interface PlanShopOverride {
  /** The slot's stable id across every shop, which keys its sold counter. */
  slotIndex: number;
  /** Indoor room index the shelf stands in. */
  roomId: number;
  /** Entrance that identifies the shop when the room is shared, or -1 for any. */
  entrance: number;
  /**
   * The overworld area the shop's own door stands in, or -1 when no door of
   * its own reaches it. Several doors share one room AND one entrance value,
   * so this is what tells them apart: the running game keeps the area a visit
   * was entered from for the whole visit (core/game-hooks/shop_table.h).
   */
  owArea: number;
  /** The shelf sprite's own subtype, which names one shelf inside the shop. */
  subtype: number;
  /** Purchase order within the slot; the shelf sells depth 0 first. */
  depthIndex: number;
  /** How many purchases the slot carries in total, so the core knows when it empties. */
  depth: number;
  /** Native currency tag (shop-price-native.ts): rupees, arrows, bombs, hearts, bottle. */
  currency: number;
  /** The amount, or the bottle-slot value a bottle price demands. */
  amount: number;
  targetLocalId: number;
}

/** In-core key-drop substitution target, present exactly for 'override-drop'. */
interface PlanDropOverride {
  /** The drop's indoor room index. */
  roomId: number;
  /** True for the large-key drop sprite, false for the small-key drop sprite. */
  big: boolean;
  targetLocalId: number;
}

interface PlanEntry {
  locationName: string;
  /** The assigned (or scouted) community-standard item name. */
  itemName: string;
  checkId?: string;
  planClass: PlanClass;
  /** How completion is observed live; absent = poll-blind (locked only). */
  detection?: CheckDetection;
  /** Override target, present exactly for 'override' entries. */
  target?: { roomId: number; chestIndex: number; targetLocalId: number };
  /** Native receive id of the assigned item, present for 'deliver' entries. */
  targetLocalId?: number;
  /** Present when the deliver should run the NPC trigger, not the queue grant. */
  npcGrant?: PlanNpcGrant;
  /** In-core substitution key, present exactly for 'override-npc' entries. */
  npcOverride?: PlanNpcOverride;
  /** In-core substitution key, present exactly for 'override-drop' entries. */
  dropOverride?: PlanDropOverride;
  /** In-core substitution key, present exactly for 'override-standing' entries. */
  standingOverride?: PlanStandingOverride;
  /** In-core substitution slot, present exactly for 'override-scripted' entries. */
  scriptedOverride?: PlanScriptedOverride;
  /** In-core substitution key, present exactly for 'override-shop' entries. */
  shopOverride?: PlanShopOverride;
}

interface PlanError {
  locationName: string;
  itemName: string;
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
  /** Locked locations with no usable detection, reported never, logged once. */
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
