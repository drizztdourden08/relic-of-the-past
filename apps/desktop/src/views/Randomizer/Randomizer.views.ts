/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import './Randomizer.css';
import {
  OptionsSlot, OptionsSummarySlot, RecentActivitySlot, RunPlayersSlot, RunProgressSlot, RunSummarySlot, SpoilerSlot,
} from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  runPanels: [RunSummarySlot, RunProgressSlot, RecentActivitySlot, RunPlayersSlot, OptionsSummarySlot],
};

export { ROTP_RANDOMIZER_VIEWS };
