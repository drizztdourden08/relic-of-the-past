/* @layer renderer-app @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { detectMsuMismatch, resolveAudioConfig } from '@rotp/features';
import { MsuMismatchCallout } from './MsuMismatchCallout';
import { deviceInput } from './device-input';
import { useActiveMsuPack } from './useActiveMsuPack';
import type { AudioDeviceControlProps } from './audio.type';

const AudioDeviceControl = (props: AudioDeviceControlProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const pack = useActiveMsuPack();
  const mismatch = settingKey === 'audioFreq' ? detectMsuMismatch(settings) : null;
  return (
    <Stack gap="xs">
      {deviceInput(settingKey, resolveAudioConfig(settings, pack), onChange, disabled)}
      {mismatch !== null && <MsuMismatchCallout message={mismatch} />}
    </Stack>
  );
};

export { AudioDeviceControl };
