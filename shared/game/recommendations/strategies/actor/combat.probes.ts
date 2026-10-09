/* @layer shared-game @kind logic */
import type { ActorRecord } from '../../../data';
import { known, unread } from '../../compare/probe-reading';
import type { FieldProbe, Probe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { profileFrom } from './combat-profile';

const readCombat = (observations: ScreenObservations, record: ActorRecord): Probe<unknown> => {
  const { spriteCombat } = observations;
  if (!spriteCombat) return unread();
  const row = spriteCombat[record.gameId.spriteType as number];
  if (!row) return unread();
  return known(profileFrom(row));
};

const combatProbe: FieldProbe<'actor'> = {
  path: 'combat',
  label: 'Combat profile',
  source: 'native:combat-table',
  confidence: 'certain',
  applies: (_observations, record) => record.gameId.spriteType != null,
  read: readCombat,
};

export { combatProbe };
