/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';
import { stringOf } from './string-of';

const numberOf = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const rowOf = (value: unknown): 1 | 2 | 3 => {
  const row = numberOf(value);
  return row === 2 || row === 3 ? row : 1;
};

const varNameOf = (value: unknown): 'player-name' | 'number' => (
  value === 'number' ? 'number' : 'player-name'
);

const cmdToken = (attrs: Record<string, unknown>): Token => {
  const name = stringOf(attrs.name);
  const param = numberOf(attrs.param);
  return param === undefined ? { t: 'cmd', name } : { t: 'cmd', name, param };
};

const varToken = (attrs: Record<string, unknown>): Token => {
  const name = varNameOf(attrs.name);
  const slot = numberOf(attrs.slot);
  return slot === undefined ? { t: 'var', name } : { t: 'var', name, slot };
};

const tokenFromAttrs = (attrs: Record<string, unknown> | null | undefined): Token | null => {
  if (attrs === null || attrs === undefined) return null;
  if (attrs.kind === 'break') return { t: 'break', row: rowOf(attrs.row) };
  if (attrs.kind === 'var') return varToken(attrs);
  if (attrs.kind === 'ref') return { t: 'ref', key: stringOf(attrs.key) };
  if (attrs.kind === 'cmd') return cmdToken(attrs);
  return null;
};

export { tokenFromAttrs };
