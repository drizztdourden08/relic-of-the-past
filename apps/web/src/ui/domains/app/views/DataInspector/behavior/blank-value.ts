/* @layer renderer-app @kind logic */
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { MAX_BLANK_DEPTH } from '../DataInspector.constants';

const keyOf = (path: string): string => path.slice(path.lastIndexOf('.') + 1);

const blankLeaf = (field: FieldDescriptor): unknown => {
  if (field.kind === 'number') return 0;
  if (field.kind === 'boolean') return false;
  if (field.kind === 'enum') return field.options?.[0] ?? '';
  if (field.kind === 'array') return [];
  return '';
};

const blankValue = (field: FieldDescriptor, depth = 0): unknown => {
  if (field.kind !== 'object') return blankLeaf(field);
  const shape: Record<string, unknown> = {};
  if (depth >= MAX_BLANK_DEPTH) return shape;
  for (const child of field.children ?? []) {
    if (child.optional) continue;
    shape[keyOf(child.path)] = blankValue(child, depth + 1);
  }
  return shape;
};

export { blankValue };
