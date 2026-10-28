/* @layer renderer-app @kind component */
import { effectiveHz } from '@drizztdourden08/brock-display';
import { useRefreshRate } from '@drizztdourden08/brock-display/renderer';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ToggleControl } from '../inputs';
import { refreshAdvisory } from './refresh-advisory';
import type { ControlContext } from '../settings-controls.type';

const VsyncToggle = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const advisory = refreshAdvisory(effectiveHz(useRefreshRate())).trim();
  return (
    <Stack gap="xs">
      <ToggleControl settingKey="vsync" value={settings.vsync} onChange={(vsync) => onChange({ vsync })} disabled={disabled} />
      {advisory !== '' && <Text variant="caption" tone="dim">{advisory}</Text>}
    </Stack>
  );
};

export { VsyncToggle };
