/* @layer shared-game @kind types */
import type { CheckRecord, ItemRecord } from '../../game/data/types';
import type { ReferenceLocation } from './reference-source.type';
import type { RomCensus } from './rom-census/rom-census.type';

type ChestVerdictKind =
  | 'ok'
  | 'position-mismatch'
  | 'vanilla-alt-id'
  | 'vanilla-wrong'
  | 'phantom-chest'
  | 'no-reference-address';

interface ChestPosition {
  roomId?: number;
  chestIndex?: number;
  vanillaByte?: number;
}

interface ChestVerdict {
  checkId: string;
  standardName: string;
  verdict: ChestVerdictKind;
  expected?: ChestPosition;
  actual?: ChestPosition;
  note?: string;
}

interface ComparatorInput {
  checks: readonly CheckRecord[];
  items: readonly ItemRecord[];
  census: RomCensus;
  flatTable: readonly { roomId: number }[];
  referenceLocations: readonly ReferenceLocation[];
  referenceLocationIds: Record<string, number>;
  nameOf: (check: CheckRecord) => string;
}

interface VanillaResolution {
  itemId: string | null;
  receiveItemId: number | null;
}

interface VanillaVerdictInput {
  checkId: string;
  standardName: string;
  censusByte: number;
  vanillaItemIds: readonly string[];
  items: readonly ItemRecord[];
  itemById: ReadonlyMap<string, ItemRecord>;
}

interface AnchorCheck {
  checkId: string;
  roomId: number;
  chestIndex: number;
}

export type {
  AnchorCheck, ChestPosition, ChestVerdict, ChestVerdictKind, ComparatorInput, VanillaResolution, VanillaVerdictInput,
};
