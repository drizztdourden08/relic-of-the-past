/* @layer tests @kind helper */
import type { FieldDescriptor, FieldKind } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: 'sample', label: 'Sample', kind, optional: false, ...extra,
});

export { field };
