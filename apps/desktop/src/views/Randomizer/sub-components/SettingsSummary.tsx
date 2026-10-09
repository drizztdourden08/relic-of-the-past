/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { settingTilesOf } from '../behavior/setting-tiles';
import { DashboardCard } from './DashboardCard';
import { StatTiles } from './StatTiles';
import type { SettingsSummaryProps } from './SettingsSummary.type';

const SettingsSummary = (props: SettingsSummaryProps) => {
  const { placement, summary, onOpenOptions } = props;
  const showAll = <Button variant="secondary" size="sm" onClick={onOpenOptions}>Show all options</Button>;

  return (
    <DashboardCard placement={placement} title="Settings" actions={showAll}>
      <StatTiles tiles={settingTilesOf(summary)} />
    </DashboardCard>
  );
};

export { SettingsSummary };
export type { SettingsSummaryProps };
