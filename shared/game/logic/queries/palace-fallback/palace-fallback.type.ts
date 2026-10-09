/* @layer shared-game @kind types */
import type { ScreenRecord } from '../../../data';

interface PalaceMismatch {
  expected: number;
  actual: number;
  room: number;
  screenId: string;
}

interface RoomScanHit {
  screen: ScreenRecord;
  expected: number;
}

export type { PalaceMismatch, RoomScanHit };
