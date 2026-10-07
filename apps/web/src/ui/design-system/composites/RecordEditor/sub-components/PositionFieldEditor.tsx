/* @layer renderer-components @kind component */
/**
 * Two axes of a grid position as one control. Writes the whole object in one
 * go, so a record with no position yet gets it complete and the object's other
 * keys stay intact.
 */
import { PositionInput } from '../../../primitives/PositionInput';
import { toNumber } from '../../field-kits/coerce';
import type { PositionAxis } from '../../../primitives/PositionInput';
import type { NumberBounds } from '../../field-kits/registry';
import type { PositionFieldEditorProps } from '../RecordEditor.type';
import '../RecordEditor.css';

/** An axis with nothing set anywhere reads as zero, which is inside every real grid. */
const ORIGIN = 0;

const axisFor = (label: string, bounds: NumberBounds | undefined): PositionAxis =>
  ({ ...bounds, label });

/** The bound's floor is the honest default for an axis that holds nothing yet. */
const coordinate = (raw: unknown, min: number | undefined): number => {
  const parsed = toNumber(raw);
  return Number.isFinite(parsed) ? parsed : (min ?? ORIGIN);
};

const PositionFieldEditor = (props: PositionFieldEditorProps) => {
  const { field, pair, binding } = props;
  const held = binding.value(field.path);
  const xBounds = binding.bounds(pair.x.path);
  const yBounds = binding.bounds(pair.y.path);

  const value = {
    x: coordinate(binding.value(pair.x.path), xBounds?.min),
    y: coordinate(binding.value(pair.y.path), yBounds?.min),
  };

  const write = (next: { x: number; y: number }): void => {
    const base = (held !== null && typeof held === 'object') ? held : {};
    binding.onChange(field.path, { ...base, [pair.xKey]: next.x, [pair.yKey]: next.y });
  };

  return (
    <PositionInput
      className="record-editor__position"
      value={value}
      x={axisFor(pair.x.label, xBounds)}
      y={axisFor(pair.y.label, yBounds)}
      disabled={binding.disabled}
      onChange={write}
    />
  );
};

export { PositionFieldEditor };
