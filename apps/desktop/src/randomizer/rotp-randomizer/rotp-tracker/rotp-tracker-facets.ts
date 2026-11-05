/* @layer renderer-app @kind logic */
import { CHECK_FACET_DEFS, matchesFacet } from '@rotp/game-data';
import type { TrackerFacetGroup } from '@drizztdourden08/brock-randomizer/tracker';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { FACET_CATEGORY_LABELS } from './rotp-tracker.constants';

const NO_FACETS: readonly string[] = [];

const groupOfCategory = (category: string): TrackerFacetGroup => ({
  id: category,
  label: FACET_CATEGORY_LABELS[category] ?? category,
  options: CHECK_FACET_DEFS.filter((def) => def.category === category).map(({ id, label }) => ({ id, label })),
});

const ROTP_FACETS: readonly TrackerFacetGroup[] = [...new Set(CHECK_FACET_DEFS.map((def) => def.category))]
  .map(groupOfCategory);

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

export { ROTP_FACETS, rotpFacetsOf };
