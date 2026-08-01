/* @layer renderer-app @kind component */
import type { AreaRecord } from '@shared/game/data';
import { Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { humanize, nameParts } from './format';
import type { Column } from './columns.type';

const asArea = (raw: Record<string, unknown>) => raw as unknown as AreaRecord;

const AREA_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '8rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asArea(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const a = asArea(raw);
      const { primary, secondary } = nameParts(a.vanillaName, a.randomizerName, a.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'world', header: 'World', width: '6rem',
    render: raw => <Text className="dataset-inspector__cell--dim">{humanize(asArea(raw).world)}</Text>,
  },
];

export { AREA_COLUMNS };
