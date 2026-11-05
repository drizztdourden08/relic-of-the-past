/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { SettingsSummary } from '@app/views/Randomizer/sub-components/SettingsSummary';
import { useRotpRunSummary } from './useRotpRunSummary';
import { OPTIONS_PAGE } from './rotp-settings-panel.constants';

const RotpSettingsPanel = ({ config, open }: RunPanelProps) => {
  const { summary } = useRotpRunSummary({ config });

  return <SettingsSummary summary={summary} onOpenOptions={() => open(OPTIONS_PAGE)} />;
};

export { RotpSettingsPanel };
