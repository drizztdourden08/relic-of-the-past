/* @layer renderer-components @kind component */
import { Toggle } from '@drizztdourden08/tessera/primitives';
import { asRecord } from '../behavior/as-record';
import { readPath } from '../behavior/read-path';
import type { SettingToggleProps } from '../SettingsLayout.type';

const SettingToggle = (props: SettingToggleProps) => {
  const { item, settings, disabled, onChange } = props;
  const { value } = readPath(asRecord(settings) ?? {}, [item.key]);
  if (typeof value !== 'boolean') return null;

  return (
    <Toggle
      label={item.label}
      description={item.description}
      checked={value}
      onChange={(next) => onChange({ [item.key]: next })}
      disabled={disabled}
      link={item.link}
    />
  );
};

export { SettingToggle };
