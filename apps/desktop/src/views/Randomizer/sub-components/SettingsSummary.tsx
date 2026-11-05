/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { settingTilesOf } from '../behavior/setting-tiles';
import { StatTiles } from './StatTiles';
import { SHOW_ALL_LABEL } from './SettingsSummary.constants';
import type { SettingsSummaryProps } from './SettingsSummary.type';

const SettingsSummary = (props: SettingsSummaryProps) => {
  const { summary, onOpenOptions } = props;

  return (
    <>
      <StatTiles tiles={settingTilesOf(summary)} />
      <Button variant="secondary" size="sm" onClick={onOpenOptions}>{SHOW_ALL_LABEL}</Button>
    </>
  );
};

export { SettingsSummary };
