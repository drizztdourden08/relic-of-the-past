/* @layer shared-game @kind logic */
import { definedEntries } from './defined-entries';
import { propKey } from './prop-key';
import { quote } from './quote';

const inlineLiteral = (v: unknown): string => {
  if (v === null) return 'null';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.length ? `[${v.map(inlineLiteral).join(', ')}]` : '[]';
  if (typeof v === 'object') {
    const parts = definedEntries(v as Record<string, unknown>).map(([k, val]) => `${propKey(k)}: ${inlineLiteral(val)}`);
    return parts.length ? `{ ${parts.join(', ')} }` : '{}';
  }
  throw new Error(`cannot serialize ${typeof v}`);
};

export { inlineLiteral };
