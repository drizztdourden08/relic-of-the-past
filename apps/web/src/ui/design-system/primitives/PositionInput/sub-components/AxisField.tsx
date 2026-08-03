/* @layer renderer-components @kind component */
/**
 * One capped axis. The numeric field itself is NumberInput, so the spinner, the
 * focus ring and the disabled treatment are the ones the rest of the system
 * already uses; this adds the cap and the draft rules on top.
 */
import { NumberInput } from '../../NumberInput';
import { useAxisDraft } from '../behavior/useAxisDraft';
import type { AxisFieldProps } from '../PositionInput.type';

const DEFAULT_STEP = 1;

const AxisField = (props: AxisFieldProps) => {
  const { axis, axisLabel, value, disabled, onCommit } = props;
  const { fieldValue, handleChange, handleBlur, handleKeyDown } = useAxisDraft({ value, axis, onCommit });

  return (
    <label className="position-input__axis">
      <span className="position-input__cap">{axisLabel}</span>
      <NumberInput
        className="position-input__field"
        value={fieldValue}
        min={axis.min}
        max={axis.max}
        step={axis.step ?? DEFAULT_STEP}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
};

export { AxisField };
