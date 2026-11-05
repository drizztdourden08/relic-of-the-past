/* @layer renderer-components @kind component */
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { SettingsSummary } from '@app/views/Randomizer/sub-components/SettingsSummary';
import { useRotpRunSummary } from './useRotpRunSummary';

const RotpSettingsPanel = ({ config }: RunPanelProps) => {
  const { summary } = useRotpRunSummary({ config });

  return <SettingsSummary summary={summary} />;
};

export { RotpSettingsPanel };
