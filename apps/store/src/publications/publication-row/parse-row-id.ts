/* @layer store-site @kind logic */
import type { PublicationTarget } from './publication-row.type';
import { SEP } from './publication-row.constants';

const parseRowId = (id: string): { itemId: string; target: PublicationTarget } | null => {
  const at = id.lastIndexOf(SEP);
  if (at <= 0) return null;
  const itemId = id.slice(0, at);
  const rest = id.slice(at + 1);
  if (rest === 'item') return { itemId, target: { kind: 'none' } };
  const version = /^v(\d+)$/.exec(rest);
  return { itemId, target: version ? { kind: 'version', n: Number(version[1]) } : { kind: 'listing', editId: rest } };
};

export { parseRowId };
