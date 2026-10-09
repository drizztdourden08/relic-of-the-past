/* @layer tests @kind constants */
import type { FieldDescriptor } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const field = (path: string, kind: FieldDescriptor['kind'], children?: FieldDescriptor[]): FieldDescriptor => {
  const descriptor: FieldDescriptor = { path, label: path, kind, optional: false };
  if (children) descriptor.children = children;
  return descriptor;
};

const NESTED: readonly FieldDescriptor[] = [
  field('id', 'idRef'),
  field('outer', 'object', [
    field('outer.a', 'string'),
    field('outer.mid', 'object', [
      field('outer.mid.b', 'number'),
      field('outer.mid.deep', 'union', [field('outer.mid.deep.c', 'boolean')]),
    ]),
  ]),
  field('tags', 'array'),
];

export { NESTED };
