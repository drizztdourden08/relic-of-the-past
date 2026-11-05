/* @layer renderer-components @kind component */
import { settingTilesOf } from '../behavior/setting-tiles';
import { StatTiles } from './StatTiles';
import type { SettingsSummaryProps } from './SettingsSummary.type';

const SettingsSummary = ({ summary }: SettingsSummaryProps) => <StatTiles tiles={settingTilesOf(summary)} />;

export { SettingsSummary };
