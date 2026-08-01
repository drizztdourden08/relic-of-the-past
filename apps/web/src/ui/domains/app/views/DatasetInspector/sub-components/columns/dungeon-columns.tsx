/* @layer renderer-app @kind component */
import type { DungeonRecord } from '@shared/game/data';
import { Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { RecordLink } from '../RecordLink';
import { nameParts } from './format';
import type { Column } from './columns.type';

const asDungeon = (raw: Record<string, unknown>) => raw as unknown as DungeonRecord;

const DUNGEON_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '8rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asDungeon(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const d = asDungeon(raw);
      const { primary, secondary } = nameParts(d.vanillaName, d.randomizerName, d.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'boss', header: 'Boss', width: '10rem',
    render: (raw, ctx) => {
      const d = asDungeon(raw);
      return <RecordLink id={d.bossCheckId} label={ctx.resolveLabel(d.bossCheckId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'prize', header: 'Prize', width: '10rem',
    render: (raw, ctx) => {
      const d = asDungeon(raw);
      return <RecordLink id={d.prizeCheckId} label={ctx.resolveLabel(d.prizeCheckId)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'medallion', header: 'Medallion', width: '9rem',
    render: (raw, ctx) => {
      const d = asDungeon(raw);
      return <RecordLink id={d.medallionGate} label={ctx.resolveLabel(d.medallionGate)} onNavigate={ctx.onNavigate} />;
    },
  },
  {
    key: 'rooms', header: 'Rooms', width: '6rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{asDungeon(raw).roomScreenIds.length}</Text>,
  },
  {
    key: 'fileStem', header: 'File', width: '10rem',
    render: raw => <Text className="dataset-inspector__cell--id dataset-inspector__cell--dim">{asDungeon(raw).fileStem}</Text>,
  },
];

export { DUNGEON_COLUMNS };
