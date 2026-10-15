/* @layer renderer-widgets @kind types */
import type { PendingScreenRecord, ScreenRecord, ScreenTag } from '@rotp/game-data';

interface ScreenDraft {
  kind: ScreenRecord['kind'];
  world: ScreenRecord['world'];
  interiorKind: ScreenRecord['interiorKind'];
  name: string;
  areaId: ScreenRecord['areaId'] | '';
  locationId: ScreenRecord['locationId'] | '';
  tags: readonly ScreenTag[];
  variant: ScreenRecord['variant'];
  roomIndex: number;
  overworldIndex: number;
  palaceIndex: number | undefined;
  entranceId: number | undefined;
  gridX: number | undefined;
  gridY: number | undefined;
  floor: number | undefined;
  existing: ScreenRecord | null;
}

interface DraftResult {
  record: PendingScreenRecord | null;
  blockers: string[];
}

export type { DraftResult, ScreenDraft };
