/* @layer renderer-components @kind component */
/**
 * One field, read-only. A leaf is a label plus whatever `renderCell` produces;
 * an `object` or `union` at the TOP level shows its children as indented rows
 * of their own, mirroring `EditorRow`'s `nestedPlanFor` — an object's children
 * come straight off the schema, a union's come off `detectUnionBranch` since
 * the schema's `children` is every branch merged.
 *
 * Recursion stops at one level, deliberately, given the width budget this view
 * is built for (a floating widget panel a few hundred pixels wide): a field
 * nested two levels down still shows in full, just as the kit's own flattened
 * one-line summary rather than as further indented rows. `EditorRow` recurses
 * to the schema's actual depth because a full editor has the height to spend;
 * this is a glanceable property sheet, so depth buys clutter faster than it
 * buys information past the first level.
 *
 * `resolveIdRefDisplay` rides along through that same recursion: a reference
 * nested inside an object gets the same name substitution a top-level one
 * does, so a caller supplies it once and every depth honours it.
 */
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { resolveFieldKit } from '../../field-kits';
import { unknownKit } from '../../field-kits/unknown-kit';
import { detectUnionBranch, isIdentityField, markedPaths } from '../../RecordEditor';
import { getPath } from '../../../data/schema/path';
import { DiffBracket } from './DiffBracket';
import type { FieldDescriptor, FieldKind } from '../../../data/schema/field-descriptor';
import type { CompactFieldProps } from '../CompactRecordView.type';
import '../CompactRecordView.css';

/** The registry answers for all nine built-ins; the fallback keeps that typed, not asserted. */
const kitFor = (kind: FieldKind) => resolveFieldKit(kind) ?? unknownKit;

/** Null for a field shown as a single row rather than a nested set — see the module note above. */
const nestedChildrenFor = (
  field: FieldDescriptor,
  value: unknown,
  depth: number,
): readonly FieldDescriptor[] | null => {
  if (depth > 0) return null;
  if (field.kind === 'object') {
    const children = field.children ?? [];
    return children.length ? children : null;
  }
  if (field.kind === 'union') {
    const branch = detectUnionBranch(field, value);
    return branch.status === 'resolved' && branch.fields.length ? branch.fields : null;
  }
  return null;
};

/**
 * The substituted display text for a reference field, or `undefined` for
 * every other kind — same contract `substituteDisplay` keeps for `DataTable`,
 * kept local here since this view has no per-column configuration to check
 * first, only the one baseline resolver.
 *
 * The identity field is exempt, same reasoning as `DataTable`'s
 * `substituteDisplay`: a collection's own `id` infers as `idRef` targeting
 * itself, so the default resolver would otherwise look the record up by its
 * own id and hand back its own name — duplicating whatever name field is
 * already its own row and hiding the id this row exists to show.
 */
const idRefDisplay = (
  field: FieldDescriptor,
  value: unknown,
  resolve: CompactFieldProps['resolveIdRefDisplay'],
): string | undefined => {
  if (field.kind !== 'idRef' || !resolve || isIdentityField(field.path)) return undefined;
  const id = typeof value === 'string' ? value.trim() : '';
  return id ? resolve(id, field.targetKind) : undefined;
};

const CompactField = (props: CompactFieldProps) => {
  const { record, field, depth, resolveIdRefDisplay, diffs } = props;
  const value = getPath(record, field.path);
  const nested = nestedChildrenFor(field, value, depth);

  if (nested) {
    // A container carries no bracket of its own — only a leaf shows a live
    // value — but it still has to say "look inside" when one of its children
    // disagrees, or an unexpanded difference would be invisible past the
    // fold. `markedPaths` (built for RecordEditor's own dirty-container rule)
    // already answers exactly this over a set of leaf paths.
    const differsBelow = diffs ? markedPaths([...diffs.keys()]).has(field.path) : false;
    const nestClass = `compact-record-view__nest${differsBelow ? ' compact-record-view__nest--differs' : ''}`;
    return (
      <Box className={nestClass}>
        <Text as="span" className="compact-record-view__nest-label" title={field.path}>
          {field.label}
        </Text>
        <Box className="compact-record-view__nested">
          {nested.map((child) => (
            <CompactField
              key={child.path}
              record={record}
              field={child}
              depth={depth + 1}
              resolveIdRefDisplay={resolveIdRefDisplay}
              diffs={diffs}
            />
          ))}
        </Box>
      </Box>
    );
  }

  const difference = diffs?.get(field.path);
  const rowClass = `compact-record-view__row${difference ? ' compact-record-view__row--differs' : ''}`;

  return (
    <Box className={rowClass}>
      <Text as="span" className="compact-record-view__label" title={field.path}>
        {field.label}
      </Text>
      <Box className="compact-record-view__value">
        {kitFor(field.kind).renderCell(value, field, {
          display: idRefDisplay(field, value, resolveIdRefDisplay),
          // An array of idRefs resolves per-entry rather than as one finished
          // string — see `array-kit`'s renderCell — so the same top-level
          // resolver rides along unwrapped for it to call per element.
          resolveIdRefDisplay,
        })}
        {difference && <DiffBracket difference={difference} />}
      </Box>
    </Box>
  );
};

export { CompactField };
