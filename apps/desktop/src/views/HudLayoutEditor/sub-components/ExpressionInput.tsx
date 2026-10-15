/* @layer renderer-components @kind component */
import { ValueInput } from './ValueInput';
import type { ExpressionInputProps } from './ExpressionInput.type';

const ExpressionInput = (props: ExpressionInputProps) => {
  const { value, onChange, ...rest } = props;
  return (
    <ValueInput
      {...rest}
      role="gate"
      value={{ from: 'data', expr: value }}
      onChange={(next) => onChange(typeof next === 'number' ? String(next) : next.expr)}
    />
  );
};

export { ExpressionInput };
