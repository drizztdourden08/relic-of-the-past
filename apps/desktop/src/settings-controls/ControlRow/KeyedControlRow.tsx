/* @layer renderer-app @kind component */
import { ControlRow } from './ControlRow';
import { useSettingItemText } from './behavior/useSettingItemText';
import type { KeyedControlRowProps } from './ControlRow.type';

const KeyedControlRow = (props: KeyedControlRowProps) => {
  const { settingKey, ...look } = props;
  const text = useSettingItemText(settingKey);
  return <ControlRow id={settingKey} {...text} {...look} />;
};

export { KeyedControlRow };
