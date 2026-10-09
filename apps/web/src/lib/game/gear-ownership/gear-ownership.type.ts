/* @layer bridge-wasm @kind types */
import type { GearLadderKind } from '@shared/game/logic/pause';

type GearTiers = Record<GearLadderKind, number>;

type SlotRecord = Record<string, GearTiers>;

export type { GearTiers, SlotRecord };
