/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { GBA_DIFFERENCES } from '@rotp/features';
import type { GbaGroup } from '@rotp/features';
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { GbaAvailability } from './gba-settings.type';

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

const GBA_GROUP_KEYS = {
  'Extra content': 'profiles:gba.group.extra-content',
  'Combat & items': 'profiles:gba.group.combat-items',
  'World & exploration': 'profiles:gba.group.world-exploration',
  'Enemies & bosses': 'profiles:gba.group.enemies-bosses',
  'Presentation': 'profiles:gba.group.presentation',
  'Audio & voice': 'profiles:gba.group.audio-voice',
  'Text & naming': 'profiles:gba.group.text-naming',
  'Save & meta': 'profiles:gba.group.save-meta',
  'Fixes': 'profiles:gba.group.fixes',
  'Removed': 'profiles:gba.group.removed',
} as const satisfies Record<GbaGroup, string>;

const gbaSchemaConfig = (t: I18n['t']): SchemaConfig => ({
  order: ['label', 'group', 'status', 'detail'],
  labels: {
    label: t('profiles:gba.column.feature'),
    group: t('profiles:gba.column.group'),
    status: t('profiles:gba.column.status'),
    detail: t('profiles:gba.column.notes'),
  },
  hidden: ['id'],
  kinds: { label: 'string', detail: 'string' },
  options: {
    group: GBA_GROUP_ORDER.map((group) => ({ value: group, label: t(GBA_GROUP_KEYS[group]) })),
    status: [
      { value: 'in-progress', label: t('profiles:gba.status.in-progress') },
      { value: 'not-started', label: t('profiles:gba.status.not-started') },
      { value: 'excluded', label: t('profiles:gba.status.excluded') },
    ],
  },
});

const gbaSchema = (t: I18n['t']) => buildSchema(GBA_DIFFERENCES, gbaSchemaConfig(t));

const GBA_TABLE_COLUMNS: readonly TableColumn[] = [
  { path: 'label', fit: true },
  { path: 'group', fit: true },
  { path: 'status', fit: true },
  { path: 'detail', grow: true },
];

const gbaCountLabel = (t: I18n['t']) => [t('profiles:gba.count.one'), t('profiles:gba.count.other')] as const;
const NO_SUPPLEMENT: GbaAvailability = { hasSupplement: false, supplementFile: null };

export {
  GBA_TABLE_COLUMNS, NO_SUPPLEMENT, gbaCountLabel, gbaSchema,
};
