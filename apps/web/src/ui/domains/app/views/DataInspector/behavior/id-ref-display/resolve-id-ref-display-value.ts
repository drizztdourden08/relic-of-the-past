/* @layer renderer-app @kind logic */
import { getPath } from '@ds/data';
import { asEntityKind } from '../as-entity-kind';
import { asDisplayText } from './as-display-text';
import { rowsFor } from './rows-for';

const resolveIdRefDisplayValue = (
  targetKind: string,
  id: string,
  displayField: string,
): string | undefined => {
  const kind = asEntityKind(targetKind);
  if (!kind) return undefined;
  const row = rowsFor(kind).get(id);
  return row ? asDisplayText(getPath(row, displayField)) : undefined;
};

export { resolveIdRefDisplayValue };
