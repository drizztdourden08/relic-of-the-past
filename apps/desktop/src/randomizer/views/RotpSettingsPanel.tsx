/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { Button } from '@drizztdourden08/tessera/primitives';
import { settingTilesOf } from '@app/views/Randomizer/behavior/setting-tiles';
import { StatTiles } from '@app/views/Randomizer/sub-components/StatTiles';
import { useRotpRunSummary } from './useRotpRunSummary';
import { OPTIONS_PAGE, SHOW_ALL_LABEL } from './rotp-settings-panel.constants';

const RotpSettingsPanel = ({ config, open }: RunPanelProps) => {
  const { summary } = useRotpRunSummary({ config });

  return (
    <>
      <StatTiles tiles={settingTilesOf(summary)} />
      <Button variant="secondary" size="sm" onClick={() => open(OPTIONS_PAGE)}>{SHOW_ALL_LABEL}</Button>
    </>
  );
};

export { RotpSettingsPanel };
