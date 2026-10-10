/* @layer store-site @kind constants */
import type { SchemaConfig } from '@drizztdourden08/tessera/data';
import type { ItemRow } from '../item-row.type';
import type { ItemSort } from './item-schema.type';
import { sampleRow } from './sample-row';

const SAMPLE_ROWS: readonly ItemRow[] = [sampleRow('music'), sampleRow('character'), sampleRow('language')];

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

const ITEM_SORTS: readonly [ItemSort, ...ItemSort[]] = [
  { id: 'popular', label: 'Most installed', entry: { path: 'installs', dir: 'desc' } },
  { id: 'rated', label: 'Top rated', entry: { path: 'rating', dir: 'desc' } },
  { id: 'reviewed', label: 'Most ratings', entry: { path: 'ratings', dir: 'desc' } },
  { id: 'name', label: 'Name', entry: { path: 'name', dir: 'asc' } },
];

export { SAMPLE_ROWS, ITEM_SCHEMA_CONFIG, ITEM_SORTS };
