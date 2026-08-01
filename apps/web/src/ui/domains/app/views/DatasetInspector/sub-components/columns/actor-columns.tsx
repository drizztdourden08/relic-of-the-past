/* @layer renderer-app @kind component */
import type { ActorRecord } from '@shared/game/data';
import { Badge, Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { humanize, nameParts } from './format';
import type { Column } from './columns.type';

const asActor = (raw: Record<string, unknown>) => raw as unknown as ActorRecord;

const formatNativeRef = (actor: ActorRecord): string => {
  const { spriteType, roomTag, objectSubIndex } = actor.gameId;
  if (spriteType !== undefined) return `sprite 0x${spriteType.toString(16)}`;
  if (roomTag !== undefined) return `tag 0x${roomTag.toString(16)}`;
  if (objectSubIndex !== undefined) return `object 0x${objectSubIndex.toString(16)}`;
  return '—';
};

const ACTOR_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '7rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asActor(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const a = asActor(raw);
      const { primary, secondary } = nameParts(a.vanillaName, a.randomizerName, a.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'kind', header: 'Kind', width: '7rem',
    render: raw => <Badge>{humanize(asActor(raw).kind)}</Badge>,
  },
  {
    key: 'native', header: 'Native ref', width: '9rem',
    render: raw => <Text className="dataset-inspector__cell--id dataset-inspector__cell--dim">{formatNativeRef(asActor(raw))}</Text>,
  },
  {
    key: 'clearedBy', header: 'Cleared by', width: '7rem',
    render: raw => (asActor(raw).clearedBy
      ? <Badge variant="warning">Gated</Badge>
      : <Text className="dataset-inspector__cell--dim">—</Text>),
  },
];

export { ACTOR_COLUMNS };
