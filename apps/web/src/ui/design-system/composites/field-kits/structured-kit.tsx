/* @layer renderer-components @kind component */
/**
 * The half an object kind and a union kind have in common. Both hold a nested
 * value at runtime, both offer existence and nothing else, and both show a
 * one-line summary in a cell, so they share one strategy factory instead of two
 * files that drift apart.
 *
 * Sorting and grouping key off the value's serialized form: identical nested
 * values land in the same bucket and sit next to each other, where the core's
 * generic fallback would stringify every object to the same text and call them
 * all equal.
 */
import type { ReactNode } from 'react';
import { registerComparator, registerGroupKey } from '../../data/table/strategy-registry';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { Text } from '../../primitives/Text';
import { isNullish } from './coerce';
import { naturalTextCompare, nullsLast } from './compare';
import { testExistence } from './emptiness';
import { summarizeEntries, toJson, truncate } from './summary';
import { registerFieldKit } from './registry';
import type { EditorControlProps, FieldTypeStrategy } from './registry';
import type { FieldKind } from '../../data/schema/field-descriptor';
import './field-kits.css';

const ABSENT = '-';

const structuredCompare = nullsLast((a, b) => naturalTextCompare(toJson(a), toJson(b)));

const structuredGroupKey = (value: unknown): string => (isNullish(value) ? '' : truncate(toJson(value)));

/** Both operators are arity 'none', so this kind never renders a filter control. */
const FilterControl = () => null;

const renderCell = (value: unknown): ReactNode => {
  if (isNullish(value)) return <Text className="field-kit__muted">{ABSENT}</Text>;
  return (
    <Text className="field-kit__text" title={toJson(value)}>
      {truncate(summarizeEntries(value))}
    </Text>
  );
};

/**
 * Nested editing belongs to RecordEditor, which walks `children` recursively and
 * (for a union) picks the branch first. Until it exists, the field states plainly
 * that it is edited elsewhere instead of pretending to be writable.
 */
const createPlaceholderEditor = (note: string) => {
  const EditorControl = (props: EditorControlProps) => {
    const { field } = props;
    return <Text className="field-kit__placeholder" title={field.path}>{note}</Text>;
  };
  return EditorControl;
};

/** Registers the shared testers/strategies for `kind` and returns its kit. */
const createStructuredKit = (kind: FieldKind, note: string): FieldTypeStrategy => {
  const kit: FieldTypeStrategy = {
    kind,
    FilterControl,
    EditorControl: createPlaceholderEditor(note),
    renderCell,
  };
  registerFieldTester(kind, { test: testExistence });
  registerComparator(kind, structuredCompare);
  registerGroupKey(kind, structuredGroupKey);
  registerFieldKit(kit);
  return kit;
};

export { createStructuredKit };
