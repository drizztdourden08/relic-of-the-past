/* @layer shared-game @kind logic */
/**
 * The `screen` comparison strategy — replaces the app-layer `screen-identity.ts`
 * detector (deleted) and drops its dependency on `screenDataStatus`: every
 * field here reads `ScreenObservations` directly, which is the entire point.
 * See `game-id.probes.ts` for why a WRONG value (not just a missing one) is
 * now reported, and `palace-mismatches.ts` for why `subjects` reaches beyond
 * the current screen.
 */
import { findOne } from '../../../data';
import type { ScreenId, ScreenRecord } from '../../../data/types';
import type { ComparisonStrategy } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { GAME_ID_PROBES } from './game-id.probes';
import { IDENTITY_PROBES } from './identity.probes';
import { resolvedPalaceMismatches } from './palace-mismatches';
import { SCREEN_PRESENCE_PROBE } from './presence.set';
import { SPAWNS_PROBE } from './spawns.set';

/**
 * The current screen plus every screen a recorded palace mismatch names,
 * deduped by id — the palace probe is the only one that needs the extras, but
 * every probe runs over whatever `subjects` returns, so the dedup happens
 * here once rather than in each probe.
 */
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
  fields: [...GAME_ID_PROBES, ...IDENTITY_PROBES, SPAWNS_PROBE],
  sets: [SCREEN_PRESENCE_PROBE],
};

export { screenStrategy };
