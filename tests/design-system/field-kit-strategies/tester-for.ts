/* @layer tests @kind helper */
import '../../../apps/web/src/ui/design-system/composites/field-kits';
import { getFieldTester } from '../../../apps/web/src/ui/design-system/data/filter/tester-registry';
import type { FieldKind } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const testerFor = (kind: FieldKind) => {
  const tester = getFieldTester(kind);
  if (!tester) throw new Error(`no tester registered for ${kind}`);
  return (value: unknown, op: string, operand?: unknown) => tester.test(value, op, operand);
};

export { testerFor };
