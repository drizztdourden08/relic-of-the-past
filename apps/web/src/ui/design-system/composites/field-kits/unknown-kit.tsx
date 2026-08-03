/* @layer renderer-components @kind component */
/**
 * The honest fallback: a value inference could not classify. It is read-only
 * everywhere and shows its serialized form, truncated, with the whole of it on
 * the tooltip.
 *
 * It still registers a tester. The core offers `is empty` / `is not empty` for
 * this kind, and existence is well defined for any value at all — leaving the
 * tester out would let someone add one of those clauses and have it quietly do
 * nothing, which is the failure the registry exists to avoid. No other operator
 * is offered, so no filter control is ever rendered.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { registerComparator, registerGroupKey } from '../../data/table/strategy-registry';
import { Text } from '../../primitives/Text';
import { isNullish } from './coerce';
import { naturalTextCompare, nullsLast } from './compare';
import { testExistence } from './emptiness';
import { toJson, truncate } from './summary';
import { registerFieldKit } from './registry';
import type { EditorControlProps, FieldTypeStrategy } from './registry';
import './field-kits.css';

const ABSENT = '—';

const compare = nullsLast((a, b) => naturalTextCompare(toJson(a), toJson(b)));

const groupKey = (value: unknown): string => (isNullish(value) ? '' : truncate(toJson(value)));

/** Only existence operators are offered, and those take no operand. */
const FilterControl = () => null;

const EditorControl = (props: EditorControlProps) => {
  const { value } = props;
  const json = toJson(value);
  return <Text className="field-kit__mono" title={json}>{truncate(json)}</Text>;
};

const renderCell = (value: unknown): ReactNode => {
  if (isNullish(value)) return <Text className="field-kit__muted">{ABSENT}</Text>;
  const json = toJson(value);
  return <Text className="field-kit__mono" title={json}>{truncate(json)}</Text>;
};

const unknownKit: FieldTypeStrategy = { kind: 'unknown', FilterControl, EditorControl, renderCell };

registerFieldTester('unknown', { test: testExistence });
registerComparator('unknown', compare);
registerGroupKey('unknown', groupKey);
registerFieldKit(unknownKit);

export { unknownKit };
