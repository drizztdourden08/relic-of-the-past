/* @layer renderer-components @kind component */
import '../TextInput/TextInput.css';
import type { NumberInputProps } from './NumberInput.type';

const NumberInput = (props: NumberInputProps) => {
  const { onChange, className = '', ...rest } = props;
  return (
    <input
      type="number"
      className={`text-input ${className}`}
      onChange={(e) => onChange?.(e.target.valueAsNumber)}
      {...rest}
    />
  );
};

export { NumberInput };
