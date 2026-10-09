/* @layer shared-game @kind logic */
import { getCheckByGameId } from '@rotp/game-data';
import type { CheckRecord, ScreenId } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { chestPresenceProbe } from './chests.set';
import { checkCorrectionProbes } from './corrections.probes';
import { roomIdOf } from './room-id-of';

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
  fields: checkCorrectionProbes,
  sets: [chestPresenceProbe],
};

export { checkStrategy };
