/* @layer shared-game @kind logic */
import { findOne } from '@rotp/game-data';
import type { ScreenId, ScreenRecord } from '@rotp/game-data';
import type { ComparisonStrategy } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { gameIdProbes } from './game-id-probes';
import { identityProbes } from './identity-probes';
import { resolvedPalaceMismatches } from './palace-mismatches';
import { screenPresenceProbe } from './screen-presence-probe';
import { spawnsProbe } from './spawns-probe';

const subjectsFor = (observations: ScreenObservations, _screenId: ScreenId | null): readonly ScreenRecord[] => {
  const byId = new Map<string, ScreenRecord>();
  if (observations.match) byId.set(observations.match.screen.id, observations.match.screen);
  for (const mismatch of resolvedPalaceMismatches(observations)) {
    if (byId.has(mismatch.screenId)) continue;
    const screen = findOne('screen', s => s.id === mismatch.screenId);
    if (screen) byId.set(screen.id, screen);
  }
  return [...byId.values()];
};

const screenStrategy: ComparisonStrategy<'screen'> = {
  kind: 'screen',
  subjects: subjectsFor,
  fields: [...gameIdProbes, ...identityProbes, spawnsProbe],
  sets: [screenPresenceProbe],
};

export { screenStrategy };
