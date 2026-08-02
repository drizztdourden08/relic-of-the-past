/* @layer renderer-app @kind data */
import type { EntityKind } from '@shared/game/data';
import type { ViewKey } from '@ds/data';

const ENTITY_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor', 'tag',
  'item-group', 'enumeration',
];

/** The side menu, in the order the collections reference each other. */
const KIND_NAV_ITEMS: { id: EntityKind; icon: string; label: string }[] = [
  { id: 'screen', icon: '🗺️', label: 'Screens' },
  { id: 'connection', icon: '🔗', label: 'Connections' },
  { id: 'check', icon: '📍', label: 'Checks' },
  { id: 'item', icon: '🎒', label: 'Items' },
  { id: 'dungeon', icon: '🏰', label: 'Dungeons' },
  { id: 'area', icon: '🌍', label: 'Areas' },
  { id: 'location', icon: '📌', label: 'Locations' },
  { id: 'actor', icon: '👾', label: 'Actors' },
  { id: 'tag', icon: '🏷️', label: 'Tags' },
  { id: 'item-group', icon: '📦', label: 'Item Groups' },
  { id: 'enumeration', icon: '🔤', label: 'Enumerations' },
];

/**
 * Two keys per collection rather than one, because two independent
 * `useViewState` bindings share this screen: `DataTable` owns its own binding
 * internally (it only takes a `viewKey`), and this screen owns the filter
 * clauses and the detail tab. Pointing both at one key would make each one's
 * write carry the OTHER half as it stood when that binding last loaded, so a
 * column drag would quietly revert a filter and vice versa. Separate keys make
 * each writer the only author of what it stores.
 */
const tableViewKey = (kind: EntityKind): ViewKey => `data-inspector:${kind}`;
const queryViewKey = (kind: EntityKind): ViewKey => `data-inspector-query:${kind}`;

export { ENTITY_KINDS, KIND_NAV_ITEMS, queryViewKey, tableViewKey };
