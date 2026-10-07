/* @layer shared-game @kind types */
/**
 * Verdict and input shapes for the S3 comparator stage of the
 * data-certification pipeline.
 */
import type { CheckRecord, ItemRecord } from '../../game/data/types';
import type { ApLocation } from './ap-source';
import type { RomCensus } from './rom-census';

type ChestVerdictKind =
  | 'ok'
  | 'position-mismatch'
  | 'vanilla-alt-id'
  | 'vanilla-wrong'
  | 'phantom-chest'
  | 'no-ap-address';

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
  /** The native chest table in table order: room ids drive the per-room ordinal join. */
  flatTable: readonly { roomId: number }[];
  apLocations: readonly ApLocation[];
  /** Datapackage location-name → id map: keydrop coverage is judged against it. */
  apLocationIds: Record<string, number>;
  /** Builds the reference project's standard name for a dataset check. */
  nameOf: (check: CheckRecord) => string;
}

export type { ChestPosition, ChestVerdict, ChestVerdictKind, ComparatorInput };
