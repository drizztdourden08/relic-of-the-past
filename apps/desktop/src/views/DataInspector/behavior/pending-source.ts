/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { KIND_NAV_ITEMS, NO_ROWS } from '../DataInspector.constants';
import type { InspectorSource } from '../DataInspector.type';

const pending = new Map<EntityKind, InspectorSource>();

const pendingSource = (kind: EntityKind): InspectorSource => {
  const ready = pending.get(kind);
  if (ready) return ready;
  const source: InspectorSource = {
    id: kind,
    label: KIND_NAV_ITEMS.find(item => item.id === kind)?.label ?? kind,
    rows: NO_ROWS,
    getId: row => String(row.id),
  };
  pending.set(kind, source);
  return source;
};

export { pendingSource };
