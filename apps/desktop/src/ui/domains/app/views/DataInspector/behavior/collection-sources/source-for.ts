/* @layer renderer-app @kind logic */
import { all } from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import { RECORD_WRITERS } from '../record-writers';
import { SCHEMA_CONFIGS } from '../schema-config';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';
import { SERIALIZERS, SOURCE_LABELS } from './source-for.constants';

const sourceFor = (kind: EntityKind): InspectorSource => ({
  id: kind,
  label: SOURCE_LABELS[kind] ?? kind,
  rows: all(kind) as readonly unknown[] as readonly InspectorRow[],
  getId: row => String(row.id),
  config: SCHEMA_CONFIGS[kind],
  serialize: SERIALIZERS[kind],
  onSave: RECORD_WRITERS[kind],
});

export { sourceFor };
