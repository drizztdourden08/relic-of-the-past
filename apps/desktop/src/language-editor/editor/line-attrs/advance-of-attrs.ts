/* @layer renderer-components @kind logic */
import type { LineAdvance } from '@rotp/languages';

const rowOf = (value: unknown): 1 | 2 | 3 => {
  const row = typeof value === 'string' ? Number(value) : value;
  return row === 2 || row === 3 ? row : 1;
};

const advanceOfAttrs = (attrs: Record<string, unknown> | null | undefined): LineAdvance => {
  if (attrs === null || attrs === undefined) return null;
  if (attrs.advanceKind === 'scroll') return { kind: 'scroll' };
  if (attrs.advanceKind === 'row') return { kind: 'row', row: rowOf(attrs.advanceRow) };
  return null;
};

export { advanceOfAttrs };
