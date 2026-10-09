/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { armOverrideFiredEvents } from '@rotp/game-core';
import { fireRegistryState } from './fire-registry-state';
import type { FireReportingSession } from './override-fire-registry.type';

const armFireReporting = (session: FireReportingSession): void => {
  const { locationByFireId, fired, firedLocationKeys, firedListeners } = fireRegistryState;
  armOverrideFiredEvents((fireId) => {
    const location = locationByFireId.get(fireId);
    if (location === undefined || fired.has(fireId)) return;
    fired.add(fireId);
    firedLocationKeys.add(location);
    log.randomizer(`[Override] Substitution fired: ${location}`);
    session.reportCheck(location);
    for (const listener of firedListeners) listener(location);
  });
};

export { armFireReporting };
