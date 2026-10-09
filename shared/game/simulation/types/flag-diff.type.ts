/* @layer shared-game @kind types */
import type { CheckId, CheckRecord, ItemId } from '../../data';
import type { VirtualPlayer } from './observation.type';

type FlagBufferKind = 'room' | 'overworld' | 'progress';

interface FlagDiff {
  kind: FlagBufferKind;
  index: number;
  before: number;
  after: number;
  setBits: number;
}

interface DetectedCheck {
  evidence: FlagDiff[];
  matched?: CheckRecord;
  checkId?: CheckId;
  itemReceived?: ItemId;
  at: VirtualPlayer;
}

export type { FlagBufferKind, FlagDiff, DetectedCheck };
