/* @layer renderer-components @kind constants */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { DirectoryRow } from './ControllerDirectory.type';

const DIRECTORY_HINT = 'A controller is bound from a console default or a pasted mapping, not from this page. A connected one opens its own page.';

const PARTIAL_NOTE = 'Showing the connected controllers only. The full list of controllers SDL3 knows arrives with Brock.';

const SEARCH_PLACEHOLDER = 'Search by name or vid:pid...';

const SEARCH_LABEL = 'Search controllers';

const EMPTY_MESSAGE = 'No controller matches.';

const COUNT_LABEL = ['controller', 'controllers'] as const;

const MAPPING_HEADER_FIELDS = 2;

const NON_CONTROL_KEYS: ReadonlySet<string> = new Set(['platform', 'crc', 'hint', 'sdk>=', 'sdk<=', 'type']);

const SAMPLE_ROW: DirectoryRow = {
  id: '', name: '', vidPid: '', family: 'generic', source: 'sdl', inputs: 0, group: 'Known', connectedKey: null,
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
      { value: 'sdl', label: 'SDL built-in' },
      { value: 'bundled', label: 'Bundled list' },
      { value: 'user', label: 'Your mapping' },
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

export {
  COUNT_LABEL, DIRECTORY_COLUMNS, DIRECTORY_GROUP_BY, DIRECTORY_HINT, DIRECTORY_SCHEMA, EMPTY_MESSAGE,
  MAPPING_HEADER_FIELDS, NON_CONTROL_KEYS, PARTIAL_NOTE, SEARCH_LABEL, SEARCH_PLACEHOLDER,
};
