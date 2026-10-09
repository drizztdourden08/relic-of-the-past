/* @layer renderer-widgets @kind types */
import type { CompactRecordViewProps } from '@drizztdourden08/tessera/composites';
import type { ConnectionRecord, EntityKind, EntityRecordMap, ReviewMark, ScreenGameId, ScreenId, ScreenSpawn } from '@rotp/game-data';
import type { PalaceMismatch } from '@rotp/game-data';
import type { ScreenMatchResult } from '@rotp/game-data';
import type { ConnectionInfo } from '@shared/game/navigation';
import type {
  Difference, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation, LiveWalkBoundary, ObservedCrossing, ObservedTransition,
  Recommendation, RecommendationAction, SpriteCombatObservation,
} from '@shared/game/recommendations';

type LiveRecord = EntityRecordMap[EntityKind];

type RecommendationFilter = 'all' | RecommendationAction;

interface FilterTab {
  id: RecommendationFilter;
  label: string;
  count: number;
}

interface UseRecommendationFilterResult {
  tabs: readonly FilterTab[];
  filter: RecommendationFilter;
  setFilter: (filter: RecommendationFilter) => void;
  filtered: readonly Recommendation[];
}

interface ScreenLiveObservations {
  screenId: ScreenId | null;
  isIndoors: boolean;
  isDarkWorld: boolean;
  match: ScreenMatchResult | null;
  liveGameId: ScreenGameId;
  realTransitions: readonly ObservedTransition[];
  realAvailable: boolean;
  unmatchedCrossings: readonly ObservedCrossing[];
  floodConnections: readonly ConnectionInfo[];
  existingConnections: readonly ConnectionRecord[];
  palaceMismatches: readonly PalaceMismatch[];
  entranceRooms?: readonly number[];
  roomTags?: readonly number[];
  dungeonMapPos?: LiveDungeonMapPosition;
  entranceSpawns?: readonly { x: number; y: number }[];
  walkBoundaries?: readonly LiveWalkBoundary[];
  doorBoundaries?: readonly LiveDoorBoundaryTile[];
}

interface SpriteLiveObservations {
  liveSprites: readonly LiveSpriteObservation[];
  spriteCombat: Readonly<Record<number, SpriteCombatObservation>>;
}

interface GrantedItemsState {
  granted: Set<number>;
  listeners: Set<() => void>;
  snapshot: readonly number[];
  wired: boolean;
}

interface CollectionTabsProps {
  selected: EntityKind;
  onSelect: (kind: EntityKind) => void;
}

interface RecommendationCardProps {
  entry: Recommendation;
}

interface RecommendationListProps {
  entries: readonly Recommendation[];
}

interface RecommendationTabsProps {
  tabs: readonly FilterTab[];
  selected: RecommendationFilter;
  onSelect: (filter: RecommendationFilter) => void;
}

interface RecordCardProps<T> {
  kind: EntityKind;
  id: string;
  record: T;
  schema: CompactRecordViewProps<T>['schema'];
  config?: CompactRecordViewProps<T>['config'];
  resolveIdRefDisplay?: CompactRecordViewProps<T>['resolveIdRefDisplay'];
  diffs?: CompactRecordViewProps<T>['diffs'];
  fieldRenderers?: CompactRecordViewProps<T>['fieldRenderers'];
}

type Reviewable = { review?: ReviewMark };

interface ReviewControlsProps {
  kind: EntityKind;
  recordId: string;
  record: Reviewable;
}

interface SpawnsSectionProps {
  spawns: readonly ScreenSpawn[] | undefined;
  diff?: Difference;
}

interface SpawnRowProps {
  spawn: ScreenSpawn;
  liveOnly?: boolean;
}

export type {
  CollectionTabsProps, FilterTab, GrantedItemsState, LiveRecord, RecommendationCardProps, RecommendationFilter, RecommendationListProps,
  RecommendationTabsProps, RecordCardProps, Reviewable, ReviewControlsProps, ScreenLiveObservations, SpawnRowProps, SpawnsSectionProps,
  SpriteLiveObservations, UseRecommendationFilterResult,
};
