/* @layer renderer-app @kind component */
import type { ScreenRecord } from '@shared/game/data';
import { StatusBadge, Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { RecordLink } from '../RecordLink';
import { humanize, nameParts } from './format';
import type { Column } from './columns.type';

const asScreen = (raw: Record<string, unknown>) => raw as unknown as ScreenRecord;

const formatRelated = (s: ScreenRecord): string => {
  const parts: string[] = [];
  if (s.triggerIds?.length) parts.push(`${s.triggerIds.length} trigger${s.triggerIds.length > 1 ? 's' : ''}`);
  if (s.spawns?.length) parts.push(`${s.spawns.length} spawn${s.spawns.length > 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : '—';
};

const SCREEN_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '7rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asScreen(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const s = asScreen(raw);
      const { primary, secondary } = nameParts(s.vanillaName, s.randomizerName, s.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'type', header: 'Type', width: '10rem',
    render: raw => {
      const s = asScreen(raw);
      return <Text className="dataset-inspector__cell--dim">{s.kind}{s.interiorKind ? ` · ${humanize(s.interiorKind)}` : ''}</Text>;
    },
  },
  {
    key: 'world', header: 'World', width: '5rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{humanize(asScreen(raw).world)}</Text>,
  },
  {
    key: 'location', header: 'Location', width: '11rem',
    render: (raw, ctx) => {
      const s = asScreen(raw);
      return <RecordLink id={s.locationId} label={ctx.resolveLabel(s.locationId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'status', header: 'Status', width: '6rem',
    render: raw => <StatusBadge status={asScreen(raw).status} />,
  },
  {
    key: 'related', header: 'Related', width: '9rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{formatRelated(asScreen(raw))}</Text>,
  },
];

export { SCREEN_COLUMNS };
