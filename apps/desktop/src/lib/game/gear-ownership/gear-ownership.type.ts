/* @layer bridge-wasm @kind types */
import type { GearLadderKind } from '@rotp/game-data';

type GearTiers = Record<GearLadderKind, number>;

type SlotRecord = Record<string, GearTiers>;

export type { GearTiers, SlotRecord };
