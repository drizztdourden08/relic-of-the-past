/* @layer renderer-components @kind component */
/**
 * The two-ended operand `is between` needs. The clause value stays a plain
 * `[low, high]` pair so it survives a round-trip through a saved view; either
 * end may be null, which reads as unbounded on that side.
 */
import { Flex } from '../../../primitives/Flex';
import { NumberInput } from '../../../primitives/NumberInput';
import { Text } from '../../../primitives/Text';
import { toNumber } from '../coerce';
import '../field-kits.css';

interface NumberRangeProps {
  value: unknown;
  onChange: (value: unknown) => void;
}

/** '' instead of NaN, so a cleared input stays cleared. */
const inputValue = (bound: unknown): number | string => {
  const parsed = toNumber(bound);
  return Number.isFinite(parsed) ? parsed : '';
};

const asBound = (entered: number): number | null => (Number.isNaN(entered) ? null : entered);

const NumberRange = (props: NumberRangeProps) => {
  const { value, onChange } = props;
  const [low, high] = Array.isArray(value) ? value : [null, null];

  return (
    <Flex gap="xs" align="center">
      <NumberInput
        value={inputValue(low)}
        placeholder="from"
        onChange={(entered) => onChange([asBound(entered), high ?? null])}
      />
      <Text className="field-kit__range-sep">-</Text>
      <NumberInput
        value={inputValue(high)}
        placeholder="to"
        onChange={(entered) => onChange([low ?? null, asBound(entered)])}
      />
    </Flex>
  );
};

export { NumberRange };
export type { NumberRangeProps };
