/* @layer store-site @kind logic */
import type { PublicationRow } from './publication-row.type';

const publicationRowId = (row: PublicationRow) => row.id;

export { publicationRowId };
