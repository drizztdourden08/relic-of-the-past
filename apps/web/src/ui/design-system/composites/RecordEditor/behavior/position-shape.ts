/* @layer renderer-components @kind logic */
/**
 * Which nested object is a grid position. Detection is by the pair's keys, not
 * the field's path, so any collection with the pair gets the paired control.
 * Deliberately not "any object with an x and a y": a rectangle has its own rules.
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
