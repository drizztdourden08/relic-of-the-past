/* @layer renderer-components @kind constants */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { DirectoryRow } from './ControllerDirectory.type';

const SEARCH_PLACEHOLDER = 'Search by name or vid:pid...';

const SEARCH_LABEL = 'Search controllers';

const EMPTY_MESSAGE = 'No controller matches.';

const COUNT_LABEL = ['controller', 'controllers'] as const;

const SAMPLE_ROW: DirectoryRow = {
  id: '', name: '', vidPid: '', family: 'generic', source: 'builtin', inputs: 0, group: 'Known', connectedKey: null,
};

const DIRECTORY_SCHEMA_CONFIG: SchemaConfig = {
  order: ['name', 'vidPid', 'family', 'source', 'inputs', 'group'],
  labels: { name: 'Name', vidPid: 'Vendor:Product', family: 'Family', source: 'Mapping source', inputs: 'Inputs', group: 'Status' },
  hidden: ['id', 'connectedKey'],
  kinds: { name: 'string', vidPid: 'string', inputs: 'number' },
  options: {
    family: [
      { value: 'xbox', label: 'Xbox' },
      { value: 'playstation', label: 'PlayStation' },
      { value: 'nintendo', label: 'Nintendo' },
      { value: 'generic', label: 'Generic' },
    ],
    source: [
      { value: 'builtin', label: 'SDL built-in' },
      { value: 'bundled', label: 'Bundled list' },
      { value: 'user', label: 'Your mapping' },
      { value: 'none', label: 'No mapping' },
    ],
    group: ['Connected', 'Known'],
  },
};

const DIRECTORY_SCHEMA = buildSchema([SAMPLE_ROW], DIRECTORY_SCHEMA_CONFIG);

const DIRECTORY_COLUMNS: readonly TableColumn[] = [
  { path: 'name', grow: true },
  { path: 'vidPid', fit: true },
  { path: 'family', fit: true },
  { path: 'source', fit: true },
  { path: 'inputs', fit: true },
];

const DIRECTORY_GROUP_BY: readonly string[] = ['group'];

const DIRECTORY_EXPANDED: readonly string[] = ['Connected'];

const DIRECTORY_VIRTUALIZE_FROM = 100;

export {
  COUNT_LABEL, DIRECTORY_COLUMNS, DIRECTORY_EXPANDED, DIRECTORY_GROUP_BY, DIRECTORY_SCHEMA, DIRECTORY_VIRTUALIZE_FROM, EMPTY_MESSAGE, SEARCH_LABEL, SEARCH_PLACEHOLDER,
};
