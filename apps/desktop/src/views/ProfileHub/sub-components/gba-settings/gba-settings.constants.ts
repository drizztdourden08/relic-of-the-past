/* @layer renderer-components @kind constants */
import { GBA_DIFFERENCES } from '@rotp/features';
import type { GbaGroup } from '@rotp/features';
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { GbaAvailability } from './gba-settings.type';

const EXTRA_DUNGEON_DESCRIPTION = 'Adds the optional post-game dungeon and its overworld entrance. Requires the second cartridge.';

const GBA_GROUP_ORDER: GbaGroup[] = [
  'Extra content',
  'Combat & items',
  'World & exploration',
  'Enemies & bosses',
  'Presentation',
  'Audio & voice',
  'Text & naming',
  'Save & meta',
  'Fixes',
  'Removed',
];

const GBA_SCHEMA_CONFIG: SchemaConfig = {
  order: ['label', 'group', 'status', 'detail'],
  labels: { label: 'Feature', group: 'Group', status: 'Status', detail: 'Notes' },
  hidden: ['id'],
  kinds: { label: 'string', detail: 'string' },
  options: {
    group: GBA_GROUP_ORDER,
    status: [
      { value: 'in-progress', label: 'In progress' },
      { value: 'not-started', label: 'Not started' },
      { value: 'excluded', label: 'Excluded' },
    ],
  },
};

const GBA_SCHEMA = buildSchema(GBA_DIFFERENCES, GBA_SCHEMA_CONFIG);

const GBA_TABLE_COLUMNS: readonly TableColumn[] = [
  { path: 'label', fit: true },
  { path: 'group', fit: true },
  { path: 'status', fit: true },
  { path: 'detail', grow: true },
];

const GBA_COUNT_LABEL = ['difference', 'differences'] as const;

const GBA_SEARCH_PLACEHOLDER = 'Search differences...';

const NO_SUPPLEMENT: GbaAvailability = { hasSupplement: false, supplementFile: null };

export {
  EXTRA_DUNGEON_DESCRIPTION, GBA_COUNT_LABEL, GBA_GROUP_ORDER, GBA_SCHEMA, GBA_SCHEMA_CONFIG,
  GBA_SEARCH_PLACEHOLDER, GBA_TABLE_COLUMNS, NO_SUPPLEMENT,
};
