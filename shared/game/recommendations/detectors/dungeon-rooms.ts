/* @layer shared-game @kind logic */
/**
 * The currently-loaded room resolves to a dungeon whose `roomScreenIds` does
 * not list this screen.
 *
 * Room-to-dungeon membership is a native, enumerable fact about the loaded
 * room — `cur_palace_index_x2` names the dungeon outright — so a missing entry
 * is proven, never inferred: `certain`. No new observation was needed for
 * this: the live palace index the game reports is already carried on
 * `liveGameId` (screen-identity's ground truth for the SAME fact), and the
 * screen this room resolved to is already carried on `context.screenId`. This
 * only joins the two through `getDungeonByGameId`.
 */
import { getDungeonByGameId } from '../../data';
import type { DungeonRecord } from '../../data';
import type { DetectionContext, RecommendationDetector } from '../detection-types';
import type { DraftRecommendation } from '../types';

const DETECTOR_ID = 'dungeon-rooms';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const draftFor = (dungeon: DungeonRecord, context: DetectionContext): DraftRecommendation<'dungeon'> => ({
  kind: 'dungeon',
  action: 'update',
  targetId: dungeon.id,
  current: dungeon,
  proposed: { ...dungeon, roomScreenIds: [...dungeon.roomScreenIds, context.screenId as NonNullable<typeof context.screenId>] },
  reason: `The game reports palace ${hex(dungeon.gameId.palaceIndex ?? -1)} for this room, but ${dungeon.randomizerName}'s `
    + 'roomScreenIds does not list this screen.',
  detector: DETECTOR_ID,
  evidence: [{
    source: 'native:room-identity',
    detail: `loaded room resolves to palace ${hex(dungeon.gameId.palaceIndex ?? -1)} (${dungeon.id})`,
  }],
  confidence: 'certain',
  screenId: context.screenId,
  origin: context.origin,
});

const dungeonRoomsDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['dungeon'],
  detect: (context: DetectionContext) => {
    const { screenId, observations } = context;
    const palaceIndex = observations.liveGameId?.palaceIndex;
    if (!screenId || palaceIndex == null) return [];

    const dungeon = getDungeonByGameId({ palaceIndex });
    if (!dungeon || dungeon.roomScreenIds.includes(screenId)) return [];

    return [draftFor(dungeon, context)];
  },
};

export { dungeonRoomsDetector };
