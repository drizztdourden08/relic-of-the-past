/* @layer renderer-app @kind component */
import { useText } from '@drizztdourden08/brock-react';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { detectMsuMismatch, resolveAudioConfig } from '@rotp/features';
import { ControlRow } from '../ControlRow';
import { useSettingItemText } from '../ControlRow/behavior/useSettingItemText';
import { MsuMismatchCallout } from './MsuMismatchCallout';
import { deviceRowLook } from './device-row-look';
import { useActiveMsuPack } from './useActiveMsuPack';
import type { AudioDeviceRowProps } from './audio.type';

const AudioDeviceRow = (props: AudioDeviceRowProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const { title, hint } = useSettingItemText(settingKey);
  const text = useText();
  const pack = useActiveMsuPack();
  const { input, description } = deviceRowLook(settingKey, { settings, resolved: resolveAudioConfig(settings, pack), onChange }, text);
  const mismatch = settingKey === 'audioFreq' ? detectMsuMismatch(settings) : null;
  return (
    <Stack gap="xs">
      <ControlRow id={settingKey} title={title} hint={hint} description={description} input={input} disabled={disabled} />
      {mismatch !== null && <MsuMismatchCallout message={mismatch} />}
    </Stack>
  );
};

export { AudioDeviceRow };
