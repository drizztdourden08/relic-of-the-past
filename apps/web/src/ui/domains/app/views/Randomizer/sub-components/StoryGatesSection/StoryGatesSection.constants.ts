/* @layer renderer-components @kind data */
/**
 * The catalog entries this section renders, read off the shipped catalog once at module
 * load, in the order the seeds list them, so the section and the list say the same thing.
 */
import { optionCatalog } from '@shared/randomizer/world/options.data';
import { STORY_GATE_OPTION_SEEDS } from '@shared/randomizer/world/story-gates/story-gate-options.data';
import type { OptionDef } from '@shared/randomizer/world/options.type';

const STORY_GATES_TITLE = 'Story gates';

const STORY_GATE_OPTIONS: readonly OptionDef[] = STORY_GATE_OPTION_SEEDS
  .map((seed) => optionCatalog.find((option) => option.key === seed.key))
  .filter((option): option is OptionDef => option !== undefined);

export { STORY_GATES_TITLE, STORY_GATE_OPTIONS };
