/* @layer shared-game @kind types */
import type {
  AreaId, CheckId, CheckKind, DungeonId, EventGroup, InteriorKind, ItemRecord, ScreenGameId, ScreenId, ScreenKind,
  ScreenWorld,
} from '../types';

interface FileTarget {
  relativePath: string | null;
  unresolved?: string;
}

interface CheckHome {
  id?: CheckId;
  screenId?: ScreenId;
  dungeonId?: DungeonId;
  kind?: CheckKind;
  eventGroup?: EventGroup;
}

type ItemHome = Pick<ItemRecord, 'category'> & Partial<Pick<ItemRecord, 'dungeonId' | 'origin' | 'gameId'>>;

interface ScreenHome {
  id?: ScreenId;
  kind: ScreenKind;
  world: ScreenWorld;
  areaId: AreaId;
  interiorKind?: InteriorKind;
  gameId: ScreenGameId;
  position?: { floor?: number };
}

export type { CheckHome, FileTarget, ItemHome, ScreenHome };
