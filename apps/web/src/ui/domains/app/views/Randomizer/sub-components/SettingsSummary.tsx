/* @layer renderer-components @kind component */
import { Button } from '@ds/primitives';
import { DashboardPanel, StatTileGrid } from '@ds/composites';
import { settingTilesOf } from '../behavior/setting-tiles';
import type { SettingsSummaryProps } from './SettingsSummary.type';

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
