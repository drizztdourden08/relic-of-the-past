/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';

const dumpSummary = (parts: Pick<NavDumpParts, 'matchingEntrances' | 'stairInfo' | 'exitScreen' | 'fallHoleLandings'>) => {
  const { matchingEntrances, stairInfo, exitScreen, fallHoleLandings } = parts;
  const spawns = matchingEntrances.filter(e => !e.isFallHole).length;
  return {
    totalEntrances: spawns + stairInfo.length,
    overworldExits: exitScreen != null ? 1 : 0,
    stairConnections: stairInfo.length,
    entranceSpawns: spawns,
    fallHoleLandingCount: fallHoleLandings.length,
    excludedFallHoleIds: matchingEntrances.filter(e => e.isFallHole).map(e => e.id),
  };
};

export { dumpSummary };
