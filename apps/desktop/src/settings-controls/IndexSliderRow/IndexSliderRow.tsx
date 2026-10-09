/* @layer renderer-app @kind component */
import { KeyedControlRow } from '../ControlRow';
import type { IndexSliderRowProps } from './IndexSliderRow.type';

const IndexSliderRow = (props: IndexSliderRowProps) => {
  const { settingKey, index, count, formatIndex, onIndex, disabled } = props;
  return (
    <KeyedControlRow
      settingKey={settingKey}
      input={{ kind: 'slider', value: index, min: 0, max: count - 1, step: 1, formatValue: formatIndex, onChange: onIndex }}
      disabled={disabled}
    />
  );
};

export { IndexSliderRow };
