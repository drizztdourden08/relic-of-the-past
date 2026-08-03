/* @layer renderer-components @kind logic */
/**
 * A cell is a dot-path read plus the field kit for that kind — the table itself
 * knows nothing about how any value looks. A column whose field the schema no
 * longer describes still renders (as plain text) rather than blanking out.
 *
 * The one thing decided here rather than in a kit is WHICH text a reference
 * shows: that comes from the column's own configuration, which is table state,
 * and from an injected lookup, which is domain data. Both are resolved to a
 * finished string before the kit is called, so the kit still only ever renders.
 */
import { resolveFieldKit } from '../../field-kits';
import { getPath } from '../../../data/schema/path';
import { substituteDisplay } from './display-substitution';
import { ABSENT_KEY_LABEL, KEY_RENDERED_KINDS } from '../DataTable.constants';
import type { ReactNode } from 'react';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { DisplaySubstitution } from './display-substitution';

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value) ?? '';
};

const cellContent = (
  row: unknown,
  path: string,
  field: FieldDescriptor | undefined,
  substitution?: DisplaySubstitution,
): ReactNode => {
  const value = getPath(row, path);
  if (!field) return asText(value);
  const kit = resolveFieldKit(field.kind);
  if (!kit) return asText(value);
  return kit.renderCell(value, field, {
    display: substituteDisplay(value, field, substitution),
    // An array of idRefs cannot be resolved to one finished string ahead of
    // time (see `array-kit`'s renderCell) — it gets the same DEFAULT resolver
    // the scalar case falls back to, one call per element, column-level
    // `displayField` choices being a per-column, single-value concept only.
    resolveIdRefDisplay: substitution?.resolveDefault,
  });
};

/**
 * A group key is already a string, so handing it back to a kit is only honest
 * for the kinds whose key IS the value. Everything else prints as it grouped.
 *
 * A grouped reference substitutes the same way its cells do, off the same
 * column setting and the same lookup — the header of a group of areas reading
 * an id while every row under it reads a name would be the odder answer.
 */
const groupKeyContent = (
  key: string,
  field: FieldDescriptor | undefined,
  substitution?: DisplaySubstitution,
): ReactNode => {
  if (!key) return ABSENT_KEY_LABEL;
  if (!field || !KEY_RENDERED_KINDS.includes(field.kind)) return key;
  const kit = resolveFieldKit(field.kind);
  if (!kit) return key;
  return kit.renderCell(key, field, { display: substituteDisplay(key, field, substitution) });
};

export { cellContent, groupKeyContent };
