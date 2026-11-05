/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import { optionTabs, ROTP_LOG_RULES, ROTP_RUN_PANELS, RotpOptionsAside } from '@app/randomizer/views';
import { ChecksWidgetContent, ChecksWidgetSettings } from '@app/views/ChecksWidget';
import { ArchipelagoFilesSlot, OptionsSlot, OptionsStepSlot, RunPlayersSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  Checks: ChecksWidgetContent,
  checksWidget: { context: 'game', order: 2, padding: 'none', icon: 'map', settings: ChecksWidgetSettings },
  optionsStep: OptionsStepSlot,
  optionTabs,
  optionsAside: RotpOptionsAside,
  optionsAsideLabel: 'Pool',
  runPanels: [ArchipelagoFilesSlot, RunPlayersSlot, ...ROTP_RUN_PANELS],
  logRules: ROTP_LOG_RULES,
};

export { ROTP_RANDOMIZER_VIEWS };
