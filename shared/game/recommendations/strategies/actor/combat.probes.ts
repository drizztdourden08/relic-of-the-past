/* @layer shared-game @kind data */
/**
 * Field probe over `ActorRecord.combat`, covering the health/flags4/per-class damage
 * facts `kSpriteInit_Health`/`Flags4`/the per-class damage lookup report for
 * a sprite type. The table is a native, enumerable fact about the SPRITE
 * TYPE, not something inferred from watching a fight, so a disagreement here
 * is always `certain`.
 *
 * `spriteCombat` only carries rows for sprite types actually observed THIS
 * PASS (see `ScreenObservations`'s own header). A type absent from it was
 * not seen this time, not proven to have no combat data. So `read`
 * returns `unread()` for that case instead of `known(undefined)`; getting
 * that backwards would propose deleting an already-correct combat profile
 * merely because this particular room did not spawn that sprite type.
 */
import type { ActorRecord } from '../../../data';
import { known, unread } from '../../compare/probe-helpers';
import type { FieldProbe, Probe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { profileFrom } from './combat-profile';

const readCombat = (observations: ScreenObservations, record: ActorRecord): Probe<unknown> => {
  const { spriteCombat } = observations;
  if (!spriteCombat) return unread();
  const row = spriteCombat[record.gameId.spriteType as number];
  // Not observed this pass for this sprite type, so stay silent. It does not mean "no data".
  if (!row) return unread();
  return known(profileFrom(row));
};

const COMBAT_PROBE: FieldProbe<'actor'> = {
  path: 'combat',
  label: 'Combat profile',
  source: 'native:combat-table',
  confidence: 'certain',
  applies: (_observations, record) => record.gameId.spriteType != null,
  read: readCombat,
};

export { COMBAT_PROBE };
