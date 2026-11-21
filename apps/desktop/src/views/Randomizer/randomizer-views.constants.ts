/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { RandomizerViews } from '@drizztdourden08/brock-randomizer';
import { optionTabs, ROTP_LOG_RULES, ROTP_RUN_PANELS, RotpOnlineSettings, RotpOptionsAside } from '@app/randomizer/views';
import { ChecksWidgetContent, ChecksWidgetSettings } from '@app/views/ChecksWidget';
import { textOf } from '@app/shell/text-bridge';
import { ARCHIPELIA_CONNECTION } from '@app/randomizer/lobby/archipelia-connection-view.constants';
import { ArchipelagoFilesSlot, OptionsSlot, SpoilerSlot } from './sub-components/slots';

const ROTP_RANDOMIZER_VIEWS: RandomizerViews = {
  Options: OptionsSlot,
  Spoiler: SpoilerSlot,
  Checks: ChecksWidgetContent,
  Online: RotpOnlineSettings,
  checksWidget: { context: 'game', order: 2, padding: 'none', icon: 'map', settings: ChecksWidgetSettings },
  optionTabs,
  optionsAside: RotpOptionsAside,
  get optionsAsideLabel() {
    return textOf(msg('views-randomizer:aside.pool'));
  },
  runPanels: [ArchipelagoFilesSlot, ...ROTP_RUN_PANELS],
  logRules: ROTP_LOG_RULES,
  connection: { archipelia: ARCHIPELIA_CONNECTION },
};

export { ROTP_RANDOMIZER_VIEWS };
