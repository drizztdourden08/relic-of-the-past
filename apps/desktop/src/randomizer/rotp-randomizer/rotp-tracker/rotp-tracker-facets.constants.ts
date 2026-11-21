/* @layer renderer-app @kind constants */
import { CHECK_FACET_DEFS } from '@rotp/game-data';
import type { TrackerFacetGroup } from '@drizztdourden08/brock-randomizer/tracker';
import { textOf } from '@app/shell/text-bridge';
import { FACET_CATEGORY_TEXT, FACET_TEXT } from './rotp-tracker-labels.constants';

const NO_FACETS: readonly string[] = [];

const ROTP_FACETS: readonly TrackerFacetGroup[] = [...new Set(CHECK_FACET_DEFS.map((def) => def.category))]
  .map((category) => ({
    id: category,
    get label() {
      const text = FACET_CATEGORY_TEXT[category];
      return text === undefined ? category : textOf(text);
    },
    options: CHECK_FACET_DEFS.filter((def) => def.category === category).map(({ id, label }) => ({
      id,
      get label() {
        return textOf(FACET_TEXT[id] ?? label);
      },
    })),
  }));

export { NO_FACETS, ROTP_FACETS };
