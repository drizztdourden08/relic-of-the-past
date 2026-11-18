/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionCatalog, STORY_GATE_OPTION_SEEDS } from '@rotp/randomizer';
import type { OptionDef } from '@rotp/randomizer';

const STORY_GATES_TITLE = msg('views-randomizer:storyGates.title');

const STORY_GATE_OPTIONS: readonly OptionDef[] = STORY_GATE_OPTION_SEEDS
  .map((seed) => optionCatalog.find((option) => option.key === seed.key))
  .filter((option): option is OptionDef => option !== undefined);

export { STORY_GATES_TITLE, STORY_GATE_OPTIONS };
