/* @layer tests @kind constants */
import type { FieldDescriptor, FieldKind } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { field } from './field';

const KINDS: readonly FieldKind[] = [
  'string', 'number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown',
];

const DESCRIPTORS: Record<FieldKind, FieldDescriptor> = {
  string: field('string'),
  number: field('number'),
  boolean: field('boolean'),
  enum: field('enum', { options: ['north', 'south'] }),
  idRef: field('idRef', { targetKind: 'screen' }),
  array: field('array', { of: field('string', { path: 'sample[]' }) }),
  object: field('object'),
  union: field('union'),
  unknown: field('unknown'),
};

export { DESCRIPTORS, KINDS };
