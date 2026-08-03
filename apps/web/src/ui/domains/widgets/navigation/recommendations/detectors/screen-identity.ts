/* @layer renderer-widgets @kind logic */
/**
 * Screen identity — the record says one thing about WHICH screen this is, and
 * the native values say another.
 *
 * Two mechanisms feed it, both of which already worked and neither of which
 * anything acted on. `screenDataStatus` computed a list of corrections that was
 * rendered as text and never applied; the palace-scan fallback recorded every
 * mislabelled screen it silently rescued and only ever `console.warn`'d them.
 * Both are real ground truth, so both become recommendations that carry a fixed
 * record.
 *
 * Only the fields the GAME can settle are proposed. A missing `locationId`,
 * floor or tag list is an authoring gap with no native answer — `screenDataStatus`
 * still reports those as issues, and inventing a value for them here would be
 * guessing dressed up as a finding.
 */
import { findOne } from '@shared/game/data';
import type { ScreenGameId, ScreenRecord } from '@shared/game/data';
import type { PalaceMismatch } from '@shared/game/logic/queries/palace-fallback';
import { getPalaceName } from '@shared/game/logic/queries/dungeon-values';
import type { DetectionContext, RecommendationDetector, ScreenObservations } from '@shared/game/recommendations';
import type { DraftRecommendation, RecommendationOrigin } from '@shared/game/recommendations';
import { screenDataStatus } from '../../screen-data-status';

const DETECTOR_ID = 'screen-identity';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const screenById = (id: string): ScreenRecord | undefined => findOne('screen', s => s.id === id);

const patched = (screen: ScreenRecord, patch: Partial<ScreenGameId>): ScreenRecord =>
  ({ ...screen, gameId: { ...screen.gameId, ...patch } });

/** A draft with everything that is identical for every finding here filled in. */
const draft = (
  current: ScreenRecord,
  proposed: ScreenRecord,
  key: string,
  reason: string,
  detail: string,
  origin: RecommendationOrigin,
): DraftRecommendation<'screen'> => ({
  kind: 'screen',
  action: 'update',
  targetId: current.id,
  current,
  proposed,
  reason,
  detector: DETECTOR_ID,
  // Every field proposed here is read off a native table, which is enumerable
  // for the loaded room — so the disagreement is proven, not inferred.
  evidence: [{ source: 'native:room-identity', detail }],
  confidence: 'certain',
  screenId: current.id,
  origin,
  key,
});

/**
 * Every palace mislabel the fallback has rescued this session, plus the current
 * one. The live match is folded in rather than handled separately so a screen
 * that appears in both produces one finding, not two that happen to share an id.
 */
const palaceMismatches = (observations: ScreenObservations): readonly PalaceMismatch[] => {
  const all = [...observations.palaceMismatches];
  const match = observations.match;
  if (match?.method !== 'palace-scan' || !match.palaceMismatch) return all;

  const live: PalaceMismatch = {
    ...match.palaceMismatch,
    room: match.screen.gameId.roomIndex ?? -1,
    screenId: match.screen.id,
  };
  const known = all.some(m => m.screenId === live.screenId && m.actual === live.actual);
  return known ? all : [...all, live];
};

const palaceDrafts = (observations: ScreenObservations, origin: RecommendationOrigin): DraftRecommendation<'screen'>[] => {
  const drafts: DraftRecommendation<'screen'>[] = [];
  for (const mismatch of palaceMismatches(observations)) {
    const current = screenById(mismatch.screenId);
    if (!current || current.gameId.palaceIndex === mismatch.actual) continue;
    drafts.push(draft(
      current,
      patched(current, { palaceIndex: mismatch.actual }),
      'gameId.palaceIndex',
      `The game reports ${getPalaceName(mismatch.actual)} (${hex(mismatch.actual)}) for room ${hex(mismatch.room)}, `
        + `but the record is tagged ${hex(mismatch.expected)} — resolved by a room scan, which costs the exact key.`,
      `room ${hex(mismatch.room)} reports palace ${hex(mismatch.actual)}; record holds ${hex(mismatch.expected)}`,
      origin,
    ));
  }
  return drafts;
};

/**
 * The two corrections `screenDataStatus` computes for the CURRENT screen that a
 * native value can actually settle. Driven off its own output rather than
 * re-deriving the conditions, so the widget's badge and this finding can never
 * disagree about whether something is wrong.
 */
const currentScreenDrafts = (observations: ScreenObservations, origin: RecommendationOrigin): DraftRecommendation<'screen'>[] => {
  const { match, isIndoors, liveGameId } = observations;
  const status = screenDataStatus(match, isIndoors);
  const current = status.screen;
  if (!current || !liveGameId) return [];

  const drafts: DraftRecommendation<'screen'>[] = [];
  const wants = (field: string): boolean => status.corrections.some(c => c.field === field);

  // Several records share this room index, so the record needs the RAM value
  // that tells them apart. The correction could name the field but never the
  // value; the live entrance id is that value.
  if (wants('gameId.entranceId') && liveGameId.entranceId != null && current.gameId.entranceId !== liveGameId.entranceId) {
    drafts.push(draft(
      current,
      patched(current, { entranceId: liveGameId.entranceId }),
      'gameId.entranceId',
      `Several records share this room index; the game entered through entrance ${hex(liveGameId.entranceId)}, `
        + 'which is what tells them apart.',
      `live entrance id ${hex(liveGameId.entranceId)}`,
      origin,
    ));
  }

  if (status.issues.includes('Missing roomIndex') && liveGameId.roomIndex != null) {
    drafts.push(draft(
      current,
      patched(current, { roomIndex: liveGameId.roomIndex }),
      'gameId.roomIndex',
      `The record carries no roomIndex; the game reports room ${hex(liveGameId.roomIndex)}.`,
      `live room index ${hex(liveGameId.roomIndex)}`,
      origin,
    ));
  }

  return drafts;
};

const screenIdentityDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['screen'],
  detect: (context: DetectionContext) => [
    ...palaceDrafts(context.observations, context.origin),
    ...currentScreenDrafts(context.observations, context.origin),
  ],
};

export { screenIdentityDetector };
