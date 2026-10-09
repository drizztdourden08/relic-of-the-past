/* @layer renderer-app @kind component */
import { ControlRow } from '../ControlRow';
import { useSettingItemText } from '../ControlRow/behavior/useSettingItemText';
import type { KeyedControlRowProps } from './KeyedControlRow.type';

const KeyedControlRow = (props: KeyedControlRowProps) => {
  const { settingKey, ...look } = props;
  const text = useSettingItemText(settingKey);
  return <ControlRow id={settingKey} {...text} {...look} />;
};

export { KeyedControlRow };
