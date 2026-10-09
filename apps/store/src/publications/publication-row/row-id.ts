/* @layer store-site @kind logic */
import type { PublicationTarget } from './publication-row.type';
import { SEP } from './publication-row.constants';

const rowId = (itemId: string, target: PublicationTarget): string => {
  if (target.kind === 'version') return `${itemId}${SEP}v${target.n}`;
  if (target.kind === 'listing') return `${itemId}${SEP}${target.editId}`;
  return `${itemId}${SEP}item`;
};

export { rowId };
