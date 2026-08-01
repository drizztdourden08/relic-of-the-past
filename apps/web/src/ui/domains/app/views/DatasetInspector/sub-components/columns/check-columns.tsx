/* @layer renderer-app @kind component */
import type { CheckRecord } from '@shared/game/data';
import { Badge, Flex, Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { RecordLink } from '../RecordLink';
import { humanize, nameParts } from './format';
import type { Column } from './columns.type';

const asCheck = (raw: Record<string, unknown>) => raw as unknown as CheckRecord;

const CHECK_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '7rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asCheck(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const c = asCheck(raw);
      const { primary, secondary } = nameParts(c.vanillaName, c.randomizerName, c.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'kind', header: 'Kind', width: '7rem',
    render: raw => <Badge>{humanize(asCheck(raw).kind)}</Badge>,
  },
  {
    key: 'screen', header: 'Screen', width: '10rem',
    render: (raw, ctx) => {
      const c = asCheck(raw);
      return <RecordLink id={c.screenId} label={ctx.resolveLabel(c.screenId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'dungeon', header: 'Dungeon', width: '9rem',
    render: (raw, ctx) => {
      const c = asCheck(raw);
      return <RecordLink id={c.dungeonId} label={ctx.resolveLabel(c.dungeonId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'grantedBy', header: 'Granted by', width: '9rem',
    render: (raw, ctx) => {
      const c = asCheck(raw);
      return <RecordLink id={c.actorId} label={ctx.resolveLabel(c.actorId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'reward', header: 'Reward', width: '10rem',
    render: (raw, ctx) => {
      const c = asCheck(raw);
      const [first, ...rest] = c.vanillaItemIds;
      if (!first) return <Text className="dataset-inspector__cell--dim">—</Text>;
      return (
        <Flex align="center" gap="xs">
          <RecordLink id={first} label={ctx.resolveLabel(first)} onNavigate={ctx.onNavigate} />
          {rest.length > 0 && <Text className="dataset-inspector__cell--dim">{`+${rest.length}`}</Text>}
        </Flex>
      );
    },
  },
  {
    key: 'requires', header: 'Requires', width: '6rem',
    render: raw => (asCheck(raw).requirements
      ? <Badge variant="warning">Gated</Badge>
      : <Text className="dataset-inspector__cell--dim">—</Text>),
  },
];

export { CHECK_COLUMNS };
