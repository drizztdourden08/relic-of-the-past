/* @layer renderer-app @kind component */
import { VolumeControl } from '@drizztdourden08/tessera/composites';
import { VOLUME_MUTED_KEYS } from './audio-controls.constants';
import type { VolumeInputProps } from './audio.type';

const VolumeInput = (props: VolumeInputProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const mutedKey = VOLUME_MUTED_KEYS[settingKey];
  return (
    <VolumeControl
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

export { VolumeInput };
