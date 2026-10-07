/* @layer renderer-components @kind logic */
/**
 * A cell is a dot-path read plus the field kit for that kind. A column the
 * schema no longer describes renders as plain text. Reference display text is
 * resolved here, before the kit is called, so the kit only renders.
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
    // An array of idRefs resolves per element with the default resolver (see
    // `array-kit`); `displayField` is a single-value, per-column choice.
    resolveIdRefDisplay: substitution?.resolveDefault,
  });
};

/**
 * A group key goes back to a kit only for kinds whose key is the value; the
 * rest print as grouped. A grouped reference substitutes like its cells do.
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
