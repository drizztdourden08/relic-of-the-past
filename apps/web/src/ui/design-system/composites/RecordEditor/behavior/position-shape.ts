/* @layer renderer-components @kind logic */
/**
 * Which nested object is a grid POSITION.
 *
 * Two numbers under one key are a coordinate, and a coordinate edited as two
 * unrelated spinners loses the thing that makes it one value: the axes belong
 * together, they are bounded together, and reading them apart is how a position
 * ends up half-written. So an object carrying the pair gets the paired control
 * and keeps ordinary rows for whatever else it holds.
 *
 * Detection is by the pair's KEYS, not by the field's own path, so a second
 * collection that grows a grid position somewhere else gets the same control
 * for free. It is deliberately not "any object with an x and a y": a rectangle
 * carries x and y too, and its width and height are extents with a different
 * floor and a cross-field rule of their own — that is a sibling control, not
 * this one wearing a rectangle's clothes.
 */
import { keyOf } from './tag-field';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { PositionPair } from '../RecordEditor.type';

const X_KEY = 'gridX';
const Y_KEY = 'gridY';

const numberChild = (
  children: readonly FieldDescriptor[],
  key: string,
): FieldDescriptor | undefined =>
  children.find((child) => keyOf(child.path) === key && child.kind === 'number');

/** The pair plus its leftovers, or undefined when this object is not a position. */
const positionPairOf = (field: FieldDescriptor): PositionPair | undefined => {
  if (field.kind !== 'object') return undefined;
  const children = field.children ?? [];
  const x = numberChild(children, X_KEY);
  const y = numberChild(children, Y_KEY);
  if (!x || !y) return undefined;
  return {
    x,
    y,
    xKey: X_KEY,
    yKey: Y_KEY,
    others: children.filter((child) => child !== x && child !== y),
  };
};

export { positionPairOf, X_KEY, Y_KEY };
