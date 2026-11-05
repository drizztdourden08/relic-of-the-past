/* @layer renderer-components @kind constants */
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import { optionTabs, ROTP_LOG_RULES, ROTP_RUN_PANELS, RotpOnlineSettings, RotpOptionsAside } from '@app/randomizer/views';
import { ChecksWidgetContent, ChecksWidgetSettings } from '@app/views/ChecksWidget';
import { ArchipeliaConnectionSlot, ArchipelagoFilesSlot, OptionsSlot, OptionsStepSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  Checks: ChecksWidgetContent,
  Online: RotpOnlineSettings,
  checksWidget: { context: 'game', order: 2, padding: 'none', icon: 'map', settings: ChecksWidgetSettings },
  optionsStep: OptionsStepSlot,
  optionTabs,
  optionsAside: RotpOptionsAside,
  optionsAsideLabel: 'Pool',
  runPanels: [ArchipelagoFilesSlot, ...ROTP_RUN_PANELS],
  logRules: ROTP_LOG_RULES,
  connection: { archipelia: ArchipeliaConnectionSlot },
};

export { ROTP_RANDOMIZER_VIEWS };
