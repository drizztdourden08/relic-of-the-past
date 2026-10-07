/* @layer store-site @kind logic */
/**
 * The schema the Browse FilterBar reads, built from the rows over one sample row per kind,
 * so the kind enum is complete before the first item is listed. Also the sorts Browse
 * offers, each a field of the row and a direction.
 */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor, SchemaConfig } from '@ds/data/schema/field-descriptor';
import type { SortEntry } from '@ds/data/table/types';
import type { ItemRow } from './item-row';

const sample = (kind: ItemRow['kind']): ItemRow => ({
  id: `sample-${kind}`,
  name: 'sample',
  summary: 'sample',
  kind,
  author: 'sample',
  version: '0.0.0',
  rating: 0,
  ratings: 0,
  installs: 0,
});

const SAMPLE_ROWS: readonly ItemRow[] = [sample('music'), sample('character'), sample('language')];

const ITEM_SCHEMA_CONFIG: SchemaConfig = {
  order: ['name', 'kind', 'author', 'version', 'rating', 'ratings', 'installs', 'summary'],
  labels: {
    name: 'Name',
    kind: 'Kind',
    author: 'Author',
    version: 'Version',
    rating: 'Rating',
    ratings: 'Ratings',
    installs: 'Installs this month',
    summary: 'Line',
  },
  hidden: ['id'],
  kinds: { name: 'string', summary: 'string', author: 'string', version: 'string', kind: 'enum' },
};

type ItemSort = { id: string; label: string; entry: SortEntry };

const ITEM_SORTS: readonly ItemSort[] = [
  { id: 'popular', label: 'Most installed', entry: { path: 'installs', dir: 'desc' } },
  { id: 'rated', label: 'Top rated', entry: { path: 'rating', dir: 'desc' } },
  { id: 'reviewed', label: 'Most ratings', entry: { path: 'ratings', dir: 'desc' } },
  { id: 'name', label: 'Name', entry: { path: 'name', dir: 'asc' } },
];

const buildItemSchema = (rows: readonly ItemRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], ITEM_SCHEMA_CONFIG);

export { buildItemSchema, ITEM_SORTS };
export type { ItemSort };
