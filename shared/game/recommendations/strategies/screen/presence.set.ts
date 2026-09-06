/* @layer shared-game @kind data */
/**
 * The missing-screen-record gap (F3): the live room resolves to NO screen
 * record at all. Before this, `use-detection-pass.ts`'s `if (!context.screenId)
 * return undefined;` guard made a null `screenId` unreachable, so an unmapped
 * room produced silence, not a finding. Removing that guard (see that file's
 * own header) is what lets this probe actually run.
 *
 * Both sides carry at most one entry: "the one screen the player is
 * currently on", identified by its game id. `datasetKey` deliberately does
 * NOT re-derive a room/palace key from the matched record's own `gameId` via
 * `gameScreenIdOf`. Several of `resolveCurrentScreenDetailed`'s resolution
 * methods (`palace-scan`, `cave-single`, `cave-ambiguous`, `variant`) return a
 * record whose own `gameId` legitimately disagrees with, or omits, the live
 * values: a palace-scan match's record still carries the STALE expected
 * palace index, not the live one (that disagreement is what
 * `palace-mismatches.ts` already corrects), and a cave/interior record
 * carries no `palaceIndex` at all while the live register does. Keying
 * independently off each side's own `gameId` would make an already-mapped
 * room fail the join and mint a spurious duplicate `create` right alongside
 * the correction the field probes already propose for the same disagreement.
 * Instead the live item carries the id `observations.match` ALREADY
 * resolved (`matchedScreenId`), and `liveKey` prefers that when present, so
 * the join can only fail, and only ever propose a `create`, when
 * `observations.match` itself is null. That is exactly the F3 case.
 */
import { gameIdLabel } from '../../../logic/queries/game-id';
import type { GameScreenId } from '../../../logic/queries/game-id';
import type { ScreenGameId, ScreenId, ScreenRecord } from '../../../data/types';
import { unread } from '../../compare/probe-helpers';
import type { Probe, SetProbe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { buildScreenDraftRecord } from './screen-draft';

/** The live "current screen" fact: the game's own id for where the player is,
 *  plus the screen id `observations.match` already resolved it to, if any. */
interface CurrentScreenIdentity {
  gameId: GameScreenId;
  matchedScreenId: ScreenId | null;
}

/**
 * `room:<index>:<palace>` or `overworld:<index>`, which carries the palace index
 * indoors so room 0x80 (a castle room) and room 0x80 (a cave) never collide.
 * This is also the finding's persisted `key` (see `detector-from-strategy.ts`):
 * a `create` draft's `screenId` is null for every unmapped room, so without a
 * per-room key every unmapped room in the game would collapse onto the same
 * one persisted recommendation. Never synthesize an id like `room-080` by
 * hand instead, because a room number alone is ambiguous, per the project's own rule.
 */
const keyOfGameScreenId = (gameId: GameScreenId): string =>
  (gameId.kind === 'overworld' ? `overworld:${gameId.screen}` : `room:${gameId.room}:${gameId.palace ?? '-'}`);

const currentGameScreenId = (observations: ScreenObservations): GameScreenId | null => {
  const { liveGameId, isIndoors } = observations;
  if (!liveGameId) return null;
  if (!isIndoors) {
    return liveGameId.overworldIndex == null ? null : { kind: 'overworld', screen: liveGameId.overworldIndex };
  }
  return liveGameId.roomIndex == null ? null : { kind: 'room', room: liveGameId.roomIndex, palace: liveGameId.palaceIndex };
};

/**
 * Not routed through `probe-helpers.ts`'s `known()`: that helper collapses a
 * missing VALUE to `undefined` for a single field, which is the wrong shape
 * for a one-item array and would widen this probe's return type with a
 * `| undefined` `SetProbe.readLive` does not declare. The array-vs-field
 * mismatch is why this is built directly instead.
 */
const readLive = (observations: ScreenObservations): Probe<readonly CurrentScreenIdentity[]> => {
  const gameId = currentGameScreenId(observations);
  if (!gameId) return unread();
  return { known: true, value: [{ gameId, matchedScreenId: observations.match?.screen.id ?? null }] };
};

const readDataset = (observations: ScreenObservations): readonly ScreenRecord[] =>
  (observations.match ? [observations.match.screen] : []);

/** Prefers the id the live match already resolved to; falls back to the raw
 *  game-id key only when there is no match at all (see the file header). */
const liveKey = (item: CurrentScreenIdentity): string => item.matchedScreenId ?? keyOfGameScreenId(item.gameId);

const datasetKey = (record: ScreenRecord): string => record.id;

const toProposed = (item: CurrentScreenIdentity, observations: ScreenObservations): Omit<ScreenRecord, 'id'> | null => {
  const { liveGameId, isIndoors, isDarkWorld } = observations;
  if (!liveGameId) return null;

  const gameId: ScreenGameId = isIndoors
    ? { roomIndex: liveGameId.roomIndex, palaceIndex: liveGameId.palaceIndex, entranceId: liveGameId.entranceId }
    : { overworldIndex: liveGameId.overworldIndex };

  // Outdoors this bit IS 'overworld', provably (`identity.probes.ts`'s
  // `KIND_PROBE` makes the same call). Indoors the game does not
  // distinguish dungeon/interior/cave on one byte, so this picks 'interior'
  // over 'dungeon': 'dungeon' asserts palace membership, an unprovable
  // POSITIVE claim from a single enumerable byte, while 'interior' is
  // already the dataset's catch-all for an indoor screen with no specific
  // palace assigned (see the `wells.ts`/`shops.ts` data files). Upgrading a
  // genuine dungeon room from 'interior' to 'dungeon' later is a one-field,
  // low-risk correction; guessing 'dungeon' wrongly would misclassify a
  // house or a cave as palace membership outright.
  return buildScreenDraftRecord(
    gameId,
    isIndoors ? 'interior' : 'overworld',
    isDarkWorld ? 'dark' : 'light',
    gameIdLabel(item.gameId),
  );
};

const SCREEN_PRESENCE_PROBE: SetProbe<'screen', CurrentScreenIdentity> = {
  id: 'screen-presence',
  noun: 'screen',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  // The absence of a MATCH is not proof a record is wrong. It may be a
  // detection bug, an unresolved variant, or a stale palace index the field
  // probes above are already correcting. Never propose deleting a screen
  // record from this.
  removable: false,
  source: 'native:room-identity',
  confidence: 'certain',
};

export { SCREEN_PRESENCE_PROBE };
export type { CurrentScreenIdentity };
