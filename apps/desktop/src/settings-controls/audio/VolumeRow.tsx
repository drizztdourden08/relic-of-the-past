/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { VolumeControl } from '@drizztdourden08/tessera/composites';
import { KeyedControlRow } from '../KeyedControlRow';
import { VOLUME_ROWS } from './audio-controls.constants';
import type { VolumeRowProps } from './audio.type';
import './VolumeRow.css';

const VolumeRow = (props: VolumeRowProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const { mutedKey } = VOLUME_ROWS[settingKey];
  const control = (
      <Box className="volume-row">
      <VolumeControl
        value={settings[settingKey]}
        step={5}
        showValue
        onChange={(value) => onChange({ [settingKey]: value })}
        muted={settings[mutedKey]}
        onMutedChange={(muted: boolean) => onChange({ [mutedKey]: muted })}
        disabled={disabled}
    />
    </Box>
  );
  return <KeyedControlRow settingKey={settingKey} input={{ kind: 'custom', control }} disabled={disabled} />;
};

export { VolumeRow };
