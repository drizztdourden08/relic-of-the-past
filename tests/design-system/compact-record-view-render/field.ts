/* @layer tests @kind helper */
import type { FieldDescriptor, FieldKind } from '@drizztdourden08/tessera/data';

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: extra.path ?? 'sample', label: 'Sample', kind, optional: false, ...extra,
});

export { field };
