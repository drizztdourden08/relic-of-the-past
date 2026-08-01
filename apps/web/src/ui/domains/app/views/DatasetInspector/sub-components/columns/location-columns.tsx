/* @layer renderer-app @kind component */
import type { LocationRecord } from '@shared/game/data';
import { Text } from '@ds/primitives';
import { NameCell } from '../NameCell';
import { RecordLink } from '../RecordLink';
import { nameParts } from './format';
import type { Column } from './columns.type';

const asLocation = (raw: Record<string, unknown>) => raw as unknown as LocationRecord;

const LOCATION_COLUMNS: Column[] = [
  {
    key: 'id', header: 'ID', width: '8rem',
    render: raw => <Text className="dataset-inspector__cell--id">{asLocation(raw).id}</Text>,
  },
  {
    key: 'name', header: 'Name', width: '1fr',
    render: raw => {
      const l = asLocation(raw);
      const { primary, secondary } = nameParts(l.vanillaName, l.randomizerName, l.id);
      return <NameCell primary={primary} secondary={secondary} />;
    },
  },
  {
    key: 'area', header: 'Area', width: '10rem',
    render: (raw, ctx) => {
      const l = asLocation(raw);
      return <RecordLink id={l.areaId} label={ctx.resolveLabel(l.areaId)} onNavigate={ctx.onNavigate} />;
    },
  },
];

export { LOCATION_COLUMNS };
