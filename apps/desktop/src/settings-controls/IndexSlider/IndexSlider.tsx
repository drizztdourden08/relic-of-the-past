/* @layer renderer-app @kind component */
import { SliderControl } from '../inputs';
import type { IndexSliderProps } from './IndexSlider.type';

const IndexSlider = (props: IndexSliderProps) => {
  const { settingKey, index, count, formatIndex, onIndex, disabled } = props;
  return <SliderControl settingKey={settingKey} value={index} min={0} max={count - 1} step={1} format={formatIndex} onChange={onIndex} disabled={disabled} />;
};

export { IndexSlider };
