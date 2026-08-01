/* @layer renderer-app @kind component */
import type { ConnectionPlacement, ConnectionRecord } from '@shared/game/data';
import { Badge, Flex, Text } from '@ds/primitives';
import { RecordLink } from '../RecordLink';
import { humanize } from './format';
import type { Column } from './columns.type';

const asConnection = (raw: Record<string, unknown>) => raw as unknown as ConnectionRecord;

const formatPlacement = (placement?: ConnectionPlacement): string => {
  if (!placement) return '—';
  if (placement.at === 'side') {
    const range = placement.tileRange ? ` [${placement.tileRange.start}-${placement.tileRange.end}]` : '';
    return `${humanize(placement.side)}${range}`;
  }
  const { x, y, w, h } = placement.rect;
  return `(${x}, ${y}) ${w}×${h}`;
};

const CONNECTION_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '7rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asConnection(raw).id}</Text>,
  },
  {
    key: 'kind', header: 'Kind', width: '7rem',
    render: raw => <Badge>{humanize(asConnection(raw).kind)}</Badge>,
  },
  {
    key: 'crossing', header: 'Crossing', width: '18rem',
    render: (raw, ctx) => {
      const c = asConnection(raw);
      return (
        <Flex align="center" gap="xs">
          <RecordLink id={c.fromScreenId} label={ctx.resolveLabel(c.fromScreenId)} onNavigate={ctx.onNavigate} />
          <Text className="dataset-inspector__cell--dim">{c.direction === 'two-way' ? '⇄' : '→'}</Text>
          <RecordLink id={c.toScreenId} label={ctx.resolveLabel(c.toScreenId)} onNavigate={ctx.onNavigate} />
        </Flex>
      );
    },
  },
  {
    key: 'placement', header: 'Placement', width: '10rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{formatPlacement(asConnection(raw).placement)}</Text>,
  },
  {
    key: 'dungeon', header: 'Dungeon', width: '9rem',
    render: (raw, ctx) => {
      const c = asConnection(raw);
      return <RecordLink id={c.dungeonId} label={ctx.resolveLabel(c.dungeonId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'counterpart', header: 'Counterpart', width: '9rem',
    render: (raw, ctx) => {
      const c = asConnection(raw);
      return <RecordLink id={c.counterpartId} label={ctx.resolveLabel(c.counterpartId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'gatedBy', header: 'Gated by', width: '9rem',
    render: (raw, ctx) => {
      const c = asConnection(raw);
      return <RecordLink id={c.gatedBy} label={ctx.resolveLabel(c.gatedBy)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'requires', header: 'Requires', width: '6rem',
    render: raw => (asConnection(raw).requirements
      ? <Badge variant="warning">Gated</Badge>
      : <Text className="dataset-inspector__cell--dim">—</Text>),
  },
];

export { CONNECTION_COLUMNS };
