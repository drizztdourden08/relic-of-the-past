/* @layer renderer-app @kind component */
import { ITEM_CATEGORY_LABELS } from '@shared/game/data';
import type { ItemRecord } from '@shared/game/data';
import { Badge, Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { RecordLink } from '../RecordLink';
import { humanize, nameParts } from './format';
import type { Column } from './columns.type';

const asItem = (raw: Record<string, unknown>) => raw as unknown as ItemRecord;

const ITEM_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '7rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asItem(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const i = asItem(raw);
      const { primary, secondary } = nameParts(i.vanillaName, i.randomizerName, i.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'origin', header: 'Origin', width: '8rem',
    render: raw => {
      const origin = asItem(raw).origin;
      return <Badge variant={origin === 'randomizer' ? 'success' : 'neutral'}>{humanize(origin)}</Badge>;
    },
  },
  {
    key: 'category', header: 'Category', width: '8rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{ITEM_CATEGORY_LABELS[asItem(raw).category]}</Text>,
  },
  {
    key: 'tier', header: 'Tier', width: '4rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{asItem(raw).tier ?? '—'}</Text>,
  },
  {
    key: 'dungeon', header: 'Dungeon', width: '9rem',
    render: (raw, ctx) => {
      const i = asItem(raw);
      return <RecordLink id={i.dungeonId} label={ctx.resolveLabel(i.dungeonId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'alias', header: 'Alias of', width: '9rem',
    render: (raw, ctx) => {
      const i = asItem(raw);
      return <RecordLink id={i.aliasOf} label={ctx.resolveLabel(i.aliasOf)} onNavigate={ctx.onNavigate} />;
    },
  },
];

export { ITEM_COLUMNS };
