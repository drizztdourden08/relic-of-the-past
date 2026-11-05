/* @layer renderer-app @kind constants */
import { CHECK_FACET_DEFS } from '@rotp/game-data';
import type { TrackerFacetGroup } from '@drizztdourden08/brock-randomizer/tracker';
import { FACET_CATEGORY_LABELS } from './rotp-tracker.constants';

const NO_FACETS: readonly string[] = [];

const ROTP_FACETS: readonly TrackerFacetGroup[] = [...new Set(CHECK_FACET_DEFS.map((def) => def.category))]
  .map((category) => ({
    id: category,
    label: FACET_CATEGORY_LABELS[category] ?? category,
    options: CHECK_FACET_DEFS.filter((def) => def.category === category).map(({ id, label }) => ({ id, label })),
  }));

export { NO_FACETS, ROTP_FACETS };
