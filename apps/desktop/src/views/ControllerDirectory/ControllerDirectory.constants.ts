/* @layer renderer-components @kind constants */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { DirectoryRow } from './ControllerDirectory.type';

const SEARCH_PLACEHOLDER = 'Search by name or vid:pid...';

const SEARCH_LABEL = 'Search controllers';

const EMPTY_MESSAGE = 'No controller matches.';

const COUNT_LABEL = ['controller', 'controllers'] as const;

const SAMPLE_ROW: DirectoryRow = { id: '', name: '', vidPid: '', family: 'generic', group: 'Known', connectedKey: null };

const DIRECTORY_SCHEMA_CONFIG: SchemaConfig = {
  order: ['name', 'vidPid', 'family', 'group'],
  labels: { name: 'Name', vidPid: 'Vendor:Product', family: 'Family', group: 'Status' },
  hidden: ['id', 'connectedKey'],
  kinds: { name: 'string', vidPid: 'string' },
  options: {
    family: [
      { value: 'xbox', label: 'Xbox' },
      { value: 'playstation', label: 'PlayStation' },
      { value: 'nintendo', label: 'Nintendo' },
      { value: 'generic', label: 'Generic' },
    ],
    group: ['Connected', 'Known'],
  },
};

const DIRECTORY_SCHEMA = buildSchema([SAMPLE_ROW], DIRECTORY_SCHEMA_CONFIG);

const DIRECTORY_COLUMNS: readonly TableColumn[] = [
  { path: 'name', grow: true },
  { path: 'vidPid', fit: true },
  { path: 'family', fit: true },
];

const DIRECTORY_GROUP_BY: readonly string[] = ['group'];

export {
  COUNT_LABEL, DIRECTORY_COLUMNS, DIRECTORY_GROUP_BY, DIRECTORY_SCHEMA, EMPTY_MESSAGE, SEARCH_LABEL, SEARCH_PLACEHOLDER,
};
