/* @layer renderer-app @kind component */
import { useText } from '@drizztdourden08/brock-react';
import { KeyedControlRow } from '../KeyedControlRow';
import type { IndexSliderRowProps } from './IndexSliderRow.type';

const IndexSliderRow = (props: IndexSliderRowProps) => {
  const { settingKey, index, count, formatIndex, onIndex, disabled } = props;
  const text = useText();
  return (
    <KeyedControlRow
      settingKey={settingKey}
      input={{ kind: 'slider', value: index, min: 0, max: count - 1, step: 1, formatValue: (value: number) => text(formatIndex(value)), onChange: onIndex }}
      disabled={disabled}
    />
  );
};

export { IndexSliderRow };
