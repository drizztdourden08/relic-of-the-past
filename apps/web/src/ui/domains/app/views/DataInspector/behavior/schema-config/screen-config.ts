/* @layer renderer-app @kind data */
/**
 * Why this override exists: the largest shape in the dataset (14 derived
 * top-level fields, four of them nested) opens with everything visible, which
 * is unreadable. `defaultColumns` picks the identity-and-placement subset a
 * reader actually scans by, and the groups give the editor a running order —
 * what it is, where it is, how it behaves — instead of key-insertion order,
 * which puts every optional field in a heap at the end.
 */
import type { SchemaConfig } from '@ds/data';

const SCREEN_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'world', 'areaId', 'locationId', 'status'],
  groups: [
    { id: 'identity', label: 'Identity', paths: ['id', 'randomizerName', 'gameId'] },
    { id: 'placement', label: 'Placement', paths: ['world', 'areaId', 'locationId', 'position'] },
    { id: 'classification', label: 'Classification', paths: ['kind', 'interiorKind', 'status', 'tags'] },
    { id: 'contents', label: 'Contents', paths: ['spawns', 'triggerIds', 'variant'] },
    { id: 'navigation', label: 'Navigation', paths: ['nav'] },
  ],
};

export { SCREEN_CONFIG };
