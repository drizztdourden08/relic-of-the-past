/* @layer shared-game @kind types */
import type { EntityKind, ConnectionRecord, ScreenGameId, ScreenId } from '@rotp/game-data';
import type { ScreenMatchResult } from '@rotp/game-data';
import type { PalaceMismatch } from '@rotp/game-data';
import type { ConnectionInfo } from '../../navigation/types';
import type { DraftRecommendation, RecommendationOrigin } from '../types';
import type {
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedTransition, SpriteCombatObservation,
} from './observation.type';

interface ScreenObservations {
  match: ScreenMatchResult | null;
  liveGameId: ScreenGameId | null;
  isIndoors: boolean;
  realTransitions: readonly ObservedTransition[];
  realAvailable: boolean;
  unmatchedCrossings: readonly ObservedCrossing[];
  floodConnections: readonly ConnectionInfo[];
  existingConnections: readonly ConnectionRecord[];
  palaceMismatches: readonly PalaceMismatch[];
  entranceRooms?: readonly number[];
  liveSprites?: readonly LiveSpriteObservation[];
  spriteCombat?: Readonly<Record<number, SpriteCombatObservation>>;
  grantedItems?: readonly GrantedItemObservation[];
  chests?: readonly ChestObservation[];
  roomTags?: readonly number[];
  dungeonMapPos?: LiveDungeonMapPosition;
  entranceSpawns?: readonly { x: number; y: number }[];
  isDarkWorld: boolean;
  walkBoundaries?: readonly LiveWalkBoundary[];
  doorBoundaries?: readonly LiveDoorBoundaryTile[];
}

interface DetectionContext {
  origin: RecommendationOrigin;
  screenId: ScreenId | null;
  observations: ScreenObservations;
}

interface RecommendationDetector {
  id: string;
  kinds: readonly EntityKind[];
  detect: (context: DetectionContext) => readonly DraftRecommendation[];
}

export type { DetectionContext, RecommendationDetector, ScreenObservations };
