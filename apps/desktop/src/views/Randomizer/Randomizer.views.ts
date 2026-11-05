/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import './Randomizer.css';
import { OptionsSlot, OptionsStepSlot, OptionsSummarySlot, RunPlayersSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  optionsStep: OptionsStepSlot,
  runPanels: [RunPlayersSlot, OptionsSummarySlot],
};

export { ROTP_RANDOMIZER_VIEWS };
