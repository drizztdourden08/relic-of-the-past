/* @layer renderer-app @kind logic */
import { CHECK_FACET_DEFS, matchesFacet } from '@rotp/game-data';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { NO_FACETS } from './rotp-tracker-facets.constants';

const cache = new Map<string, readonly string[]>();

const rotpFacetsOf = (location: string): readonly string[] => {
  const hit = cache.get(location);
  if (hit !== undefined) return hit;
  const check = trackerCheckOf(location);
  const facets = check === undefined
    ? NO_FACETS
    : CHECK_FACET_DEFS.filter((def) => matchesFacet(check, def.id)).map((def) => def.id);
  cache.set(location, facets);
  return facets;
};

export { rotpFacetsOf };
