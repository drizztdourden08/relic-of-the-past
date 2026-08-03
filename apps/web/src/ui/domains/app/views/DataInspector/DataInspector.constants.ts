/* @layer renderer-app @kind data */
import type { EntityKind } from '@shared/game/data';
import type { ViewKey } from '@ds/data';
import type { InspectorKind } from './DataInspector.type';

const ENTITY_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor', 'tag',
  'item-group', 'enumeration',
];

/** The pseudo-collection: findings ABOUT the dataset, not records in it. */
const RECOMMENDATIONS_KIND = 'recommendations';

/** Narrows an inspector kind back to one of the eleven real collections. */
const isEntityKind = (kind: InspectorKind): kind is EntityKind => kind !== RECOMMENDATIONS_KIND;

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
 * The pseudo-collection's own rail entry — permanent, like every real one, so
 * a review pass is reachable directly rather than only by arriving through a
 * jump (see `useDataInspector`'s `pendingRecommendation` handling).
 */
const RECOMMENDATIONS_NAV_ITEM = { id: RECOMMENDATIONS_KIND, icon: '⚠️', label: 'Recommendations' };

/** The side menu: the eleven real collections, plus the pseudo-collection at a fixed spot. */
const NAV_ITEMS: { id: string; icon: string; label: string }[] = [...KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM];

/**
 * Two keys per collection rather than one, because two independent
 * `useViewState` bindings share this screen: `DataTable` owns its own binding
 * internally (it only takes a `viewKey`), and this screen owns the filter
 * clauses and the detail tab. Pointing both at one key would make each one's
 * write carry the OTHER half as it stood when that binding last loaded, so a
 * column drag would quietly revert a filter and vice versa. Separate keys make
 * each writer the only author of what it stores.
 */
const tableViewKey = (kind: InspectorKind): ViewKey => `data-inspector:${kind}`;
const queryViewKey = (kind: InspectorKind): ViewKey => `data-inspector-query:${kind}`;

export {
  ENTITY_KINDS, KIND_NAV_ITEMS, NAV_ITEMS, RECOMMENDATIONS_KIND, RECOMMENDATIONS_NAV_ITEM,
  isEntityKind, queryViewKey, tableViewKey,
};
