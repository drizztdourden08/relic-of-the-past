/* @layer renderer-components @kind component */
/**
 * Lists. Sorting and grouping both key off LENGTH, the only ordering a list has
 * that means anything; the generic fallback would stringify the whole list and
 * sort on its first character.
 *
 * Editing is a read-only summary in this pass. Adding, removing and reordering
 * elements is a RecordEditor concern: it needs the element's own editor
 * recursively plus row affordances a one-line cell has no place for.
 *
 * One element kind is not read as raw text. A list of `idRef`s reads as one
 * resolved chip per entry (see `IdRefBadgeList`), the array counterpart of the
 * single-value reference cell. Everything else keeps the flattened summary.
 */
import type { ReactNode } from 'react';
import { registerFieldTester } from '../../data/filter/tester-registry';
import { registerComparator, registerGroupKey } from '../../data/table/strategy-registry';
import { Badge } from '../../primitives/Badge';
import { Flex } from '../../primitives/Flex';
import { NumberInput } from '../../primitives/NumberInput';
import { Text } from '../../primitives/Text';
import { isBlankOperand, isNullish, toList, toNumber, toText } from './coerce';
import { nullsLast } from './compare';
import { countLabel, summarizeList, toJson } from './summary';
import { registerFieldKit } from './registry';
import { ElementValueInput } from './sub-components/ElementValueInput';
import { IdRefBadgeList } from './sub-components/IdRefBadgeList';
import type { CellRenderOptions, EditorControlProps, FieldTypeStrategy, FilterControlProps } from './registry';
import type { FieldDescriptor } from '../../data/schema/field-descriptor';
import './field-kits.css';

const LENGTH_OPS = ['lengthEq', 'lengthGt', 'lengthLt'];

/** A scalar element must equal the operand; a richer one is matched on its text form. */
const elementMatches = (element: unknown, needle: string): boolean => {
  if (element !== null && typeof element === 'object') {
    return toJson(element).toLowerCase().includes(needle);
  }
  return toText(element).toLowerCase() === needle;
};

const test = (value: unknown, op: string, operand: unknown): boolean => {
  const list = toList(value);
  if (op === 'isEmpty') return list.length === 0;
  if (op === 'isNotEmpty') return list.length > 0;
  if (isBlankOperand(operand)) return true;
  if (op === 'containsValue') {
    const needle = toText(operand).trim().toLowerCase();
    return list.some((element) => elementMatches(element, needle));
  }
  const target = toNumber(operand);
  if (!Number.isFinite(target)) return true;
  if (op === 'lengthEq') return list.length === target;
  if (op === 'lengthGt') return list.length > target;
  if (op === 'lengthLt') return list.length < target;
  return true;
};

const compare = nullsLast((a, b) => toList(a).length - toList(b).length);

const groupKey = (value: unknown): string => (isNullish(value) ? '' : countLabel(toList(value).length));

const FilterControl = (props: FilterControlProps) => {
  const { field, op, value, onChange } = props;
  if (LENGTH_OPS.includes(op)) {
    const parsed = toNumber(value);
    return (
      <NumberInput
        value={Number.isFinite(parsed) ? parsed : ''}
        min={0}
        placeholder="count"
        onChange={(entered) => onChange(Number.isNaN(entered) ? null : entered)}
      />
    );
  }
  return (
    <ElementValueInput
      element={field.of}
      value={value}
      placeholder={field.label}
      onChange={onChange}
    />
  );
};

/** Read-only for now: a count plus what is in it, so the record still reads fully. */
const EditorControl = (props: EditorControlProps) => {
  const { value } = props;
  const list = toList(value);
  const preview = summarizeList(list);
  return (
    <Flex gap="sm" align="center">
      <Badge variant="neutral">{countLabel(list.length)}</Badge>
      <Text className="field-kit__text" title={toJson(list)}>{preview}</Text>
    </Flex>
  );
};

const renderCell = (value: unknown, field: FieldDescriptor, options?: CellRenderOptions): ReactNode => {
  const list = toList(value);
  if (!list.length) return <Text className="field-kit__muted">{countLabel(0)}</Text>;
  if (field.of?.kind === 'idRef') {
    return (
      <IdRefBadgeList
        list={list}
        targetKind={field.of.targetKind}
        resolveIdRefDisplay={options?.resolveIdRefDisplay}
      />
    );
  }
  return (
    <Text className="field-kit__text" title={`${field.label}: ${toJson(list)}`}>
      {summarizeList(list)}
    </Text>
  );
};

const arrayKit: FieldTypeStrategy = { kind: 'array', FilterControl, EditorControl, renderCell };

registerFieldTester('array', { test });
registerComparator('array', compare);
registerGroupKey('array', groupKey);
registerFieldKit(arrayKit);

export { arrayKit };
