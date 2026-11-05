/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import { optionTabs, ROTP_LOG_RULES, ROTP_RUN_PANELS, RotpOptionsAside } from '@app/randomizer/views';
import { ArchipelagoFilesSlot, OptionsSlot, OptionsStepSlot, RunPlayersSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  optionsStep: OptionsStepSlot,
  optionTabs,
  optionsAside: RotpOptionsAside,
  runPanels: [ArchipelagoFilesSlot, RunPlayersSlot, ...ROTP_RUN_PANELS],
  logRules: ROTP_LOG_RULES,
};

export { ROTP_RANDOMIZER_VIEWS };
