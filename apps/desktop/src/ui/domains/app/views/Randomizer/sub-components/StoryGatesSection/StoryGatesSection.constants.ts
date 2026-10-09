/* @layer renderer-components @kind constants */
import { optionCatalog } from '@rotp/randomizer';
import { STORY_GATE_OPTION_SEEDS } from '@rotp/randomizer';
import type { OptionDef } from '@rotp/randomizer';

const STORY_GATES_TITLE = 'Story gates';

const STORY_GATE_OPTIONS: readonly OptionDef[] = STORY_GATE_OPTION_SEEDS
  .map((seed) => optionCatalog.find((option) => option.key === seed.key))
  .filter((option): option is OptionDef => option !== undefined);

export { STORY_GATES_TITLE, STORY_GATE_OPTIONS };
