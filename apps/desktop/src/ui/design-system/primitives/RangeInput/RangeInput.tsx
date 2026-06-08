/* @layer renderer-components @kind component */
import './RangeInput.css';
import type { RangeInputProps } from './RangeInput.type';

const RangeInput = (props: RangeInputProps) => {
  const { className = '', ...rest } = props;
  return <input type="range" className={`range-input ${className}`} {...rest} />;
};

export { RangeInput };
