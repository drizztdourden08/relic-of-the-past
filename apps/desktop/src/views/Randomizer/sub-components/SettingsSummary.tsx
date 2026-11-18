/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { StatTiles } from './StatTiles';
import { settingTilesOf } from '../behavior/setting-tiles';
import type { SettingsSummaryProps } from './SettingsSummary.type';

const SettingsSummary = ({ summary }: SettingsSummaryProps) => <StatTiles tiles={settingTilesOf(useT(), summary)} />;

export { SettingsSummary };
