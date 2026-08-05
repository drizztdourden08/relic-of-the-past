/* @layer shared-game @kind logic */
/**
 * The `check` comparison strategy — replaces the `check-presence.ts`
 * detector (deleted): `CHEST_PRESENCE_PROBE` covers a chest the room draws
 * that no record catalogues, `CHECK_CORRECTION_PROBES` cover an existing
 * record the same chest table proves wrong about its `kind` or `screenId`.
 *
 * `subjects` resolves each of the current room's chests to its own
 * `CheckRecord`, exactly like the detector this replaces did per chest via
 * `getCheckByGameId` — a check with no chest match here gets no field-level
 * correction at all, which is correct: `CHEST_PRESENCE_PROBE` is what
 * proposes a record for it instead.
 */
import { getCheckByGameId } from '../../../data';
import type { CheckRecord, ScreenId } from '../../../data';
import type { ComparisonStrategy } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { CHEST_PRESENCE_PROBE } from './chests.set';
import { CHECK_CORRECTION_PROBES } from './corrections.probes';
import { roomIdOf } from './chest-lookup';

const subjectsFor = (observations: ScreenObservations, screenId: ScreenId | null): readonly CheckRecord[] => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  if (!chests || roomId == null || !screenId) return [];

  const out: CheckRecord[] = [];
  for (const chest of chests) {
    const current = getCheckByGameId({ roomId, chestIndex: chest.chestIndex });
    if (current) out.push(current);
  }
  return out;
};

const checkStrategy: ComparisonStrategy<'check'> = {
  kind: 'check',
  subjects: subjectsFor,
  fields: CHECK_CORRECTION_PROBES,
  sets: [CHEST_PRESENCE_PROBE],
};

export { checkStrategy };
