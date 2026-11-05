/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import './Randomizer.css';
import { OptionsSlot, OptionsSummarySlot, RunPlayersSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  runPanels: [RunPlayersSlot, OptionsSummarySlot],
};

export { ROTP_RANDOMIZER_VIEWS };
