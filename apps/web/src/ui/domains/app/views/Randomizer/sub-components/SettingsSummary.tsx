/* @layer renderer-components @kind component */
/**
 * The options summary's settings panel: how far the settings depart from the game as shipped,
 * one tile each with its meter (settings changed, dungeon items moved, rungs, story gates,
 * dark-room lights, ponds), and the button to the full list on the Options tab.
 */
import { Button } from '@ds/primitives';
import { DashboardPanel, StatTileGrid } from '@ds/composites';
import { settingTilesOf } from '../behavior/options-summary-tiles';
import type { OptionsSummary } from '../behavior/options-summary.type';
import type { PanelPlacement } from '../Randomizer.constants';

interface SettingsSummaryProps {
  placement: PanelPlacement;
  summary: OptionsSummary;
  onOpenOptions: () => void;
}

const SettingsSummary = (props: SettingsSummaryProps) => {
  const { placement, summary, onOpenOptions } = props;
  const showAll = <Button variant="secondary" size="sm" onClick={onOpenOptions}>Show all options</Button>;

  return (
    <DashboardPanel {...placement} title="Settings" action={showAll}>
      <StatTileGrid tiles={settingTilesOf(summary)} />
    </DashboardPanel>
  );
};

export { SettingsSummary };
export type { SettingsSummaryProps };
