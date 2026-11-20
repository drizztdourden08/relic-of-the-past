/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { Button } from '@drizztdourden08/tessera/primitives';
import { OPTIONS_PAGE } from './rotp-settings-panel.constants';

const RotpSettingsActions = ({ open }: RunPanelProps) => {
  const t = useT();
  return <Button variant="secondary" size="sm" onClick={() => open(OPTIONS_PAGE)}>{t('views-randomizer:run.show-all-options')}</Button>;
};

export { RotpSettingsActions };
