/* @layer renderer-app @kind types */
import type { EntityKind } from '@shared/game/data';

interface DatasetSearchResult {
  id: string;
  raw: Record<string, unknown>;
}

const ENTITY_KIND_OPTIONS: { value: EntityKind; label: string }[] = [
  { value: 'screen', label: 'Screens' },
  { value: 'connection', label: 'Connections' },
  { value: 'check', label: 'Checks' },
  { value: 'item', label: 'Items' },
  { value: 'dungeon', label: 'Dungeons' },
  { value: 'area', label: 'Areas' },
  { value: 'location', label: 'Locations' },
  { value: 'actor', label: 'Actors' },
];

export { ENTITY_KIND_OPTIONS };
export type { DatasetSearchResult };
