/* @layer shared-game @kind logic */
/**
 * Shared per-record helpers for the `check` strategy's chest-backed probes
 * (`chests.set.ts`, `corrections.probes.ts`): the current room's own index,
 * and the live `ChestObservation` a `CheckRecord` resolves to, if any.
 *
 * `chestFor` re-derives the match from `record.gameId` instead of caching
 * it from `subjects`, because a `FieldProbe`'s `read`/`applies` only ever receive
 * `(observations, record)` (see `probe.types.ts`), so there is no channel to
 * pass a value computed while building `subjects` through to a field probe;
 * recomputing here is the only option, and it is cheap (a small array scan).
 */
import type { CheckRecord } from '../../../data';
import type { ChestObservation, ScreenObservations } from '../../detection-types';

/** The loaded room's index, or null when there is none to read (outdoors,
 *  or the room table was never read). */
const roomIdOf = (observations: ScreenObservations): number | null => (
  observations.isIndoors ? observations.liveGameId?.roomIndex ?? null : null
);

/** The chest this record's own `{roomId, chestIndex}` names, if the current
 *  room's chest table both was read and actually draws it. */
const chestFor = (observations: ScreenObservations, record: CheckRecord): ChestObservation | undefined => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  if (!chests || roomId == null || record.gameId.roomId !== roomId) return undefined;
  return chests.find(chest => chest.chestIndex === record.gameId.chestIndex);
};

export { chestFor, roomIdOf };
