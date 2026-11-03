/* @layer renderer-app @kind component */
import { SettingsRow } from '@drizztdourden08/tessera/composites';
import { useSettingItem } from '../setting-label/useSettingItem';
import type { ColorRowProps } from './color-row.type';
import './ColorRow.css';

const ColorRow = (props: ColorRowProps) => {
  const { settingKey, value, original, onChange, disabled } = props;
  const item = useSettingItem(settingKey);
  const description = item?.noDescription === true ? undefined : item?.description;
  const text = description === undefined || description === '' ? { noDescription: true as const } : { description };
  return (
    <SettingsRow
      id={settingKey}
      title={item?.label ?? settingKey}
      hint={item?.hint}
      {...text}
      input={{ kind: 'color', value, onChange: (hex: string) => onChange({ [settingKey]: hex }) }}
      disabled={disabled}
      changed={value.toLowerCase() !== original.toLowerCase()}
      onReset={() => onChange({ [settingKey]: original })}
      className="color-row"
    />
  );
};

export { ColorRow };
