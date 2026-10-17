/* @layer renderer-app @kind component */
import { VolumeControl } from '@drizztdourden08/tessera/composites';
import { VOLUME_ROWS } from './audio-controls.constants';
import type { VolumeRowProps } from './audio.type';

const VolumeRow = (props: VolumeRowProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const { label, description, mutedKey } = VOLUME_ROWS[settingKey];
  return (
    <VolumeControl
      label={label}
      description={description}
      value={settings[settingKey]}
      step={5}
      showValue
      onChange={(value) => onChange({ [settingKey]: value })}
      muted={settings[mutedKey]}
      onMutedChange={(muted: boolean) => onChange({ [mutedKey]: muted })}
      disabled={disabled}
    />
  );
};

export { VolumeRow };
