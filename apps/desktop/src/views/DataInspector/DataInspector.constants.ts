/* @layer renderer-app @kind data */
import type { IconifyIcon as IconData } from '@iconify/react/offline';
import mapIcon from '@iconify-icons/lucide/map';
import linkIcon from '@iconify-icons/lucide/link';
import pinIcon from '@iconify-icons/lucide/map-pin';
import backpackIcon from '@iconify-icons/lucide/backpack';
import castleIcon from '@iconify-icons/lucide/castle';
import globeIcon from '@iconify-icons/lucide/globe';
import flagIcon from '@iconify-icons/lucide/flag';
import ghostIcon from '@iconify-icons/lucide/ghost';
import tagIcon from '@iconify-icons/lucide/tag';
import boxesIcon from '@iconify-icons/lucide/boxes';
import typeIcon from '@iconify-icons/lucide/type';
import alertIcon from '@iconify-icons/lucide/alert-triangle';
import type { ConnectionPlacement, EntityKind } from '@rotp/game-data';
import type { DetailTab, FieldDescriptor, TableColumn, TableState } from '@drizztdourden08/tessera/data';
import type { IdRefTargetField, IdRefOption, NumberBounds } from '@drizztdourden08/tessera/composites';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { DeleteGuardDialogState } from './DataInspector.type';

const ENTITY_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor', 'tag',
  'item-group', 'enumeration',
];

const RECOMMENDATIONS_KIND = 'recommendations';

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

const RECOMMENDATIONS_NAV_ITEM = { id: RECOMMENDATIONS_KIND, icon: '⚠️', label: 'Recommendations' };

const NAV_ITEMS: { id: string; icon: string; label: string }[] = [...KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM];

const NAV_ICONS: Record<string, IconData> = {
  screen: mapIcon,
  connection: linkIcon,
  check: pinIcon,
  item: backpackIcon,
  dungeon: castleIcon,
  area: globeIcon,
  location: flagIcon,
  actor: ghostIcon,
  tag: tagIcon,
  'item-group': boxesIcon,
  enumeration: typeIcon,
  [RECOMMENDATIONS_NAV_ITEM.id]: alertIcon,
};

const FALLBACK_NAV_ICON: IconData = typeIcon;

const NO_SOURCE_FILE = 'No source file could be derived for this record.';
const TAG_NAME_MISMATCH = "A tag's name must read namespace:value, matching its own namespace and value.";
const TAG_NOT_CONVENTION = 'Tags must be in the form namespace:value.';
const TAG_NO_SCOPE = 'This collection has no tag vocabulary to file a new term under.';

const EMPTY_PLACEMENT: ConnectionPlacement = { form: 'area', rect: { x: 0, y: 0, w: 0, h: 0 }, tiles: [] };

const CREATE_ONLY_EXCLUDED: Partial<Record<EntityKind, readonly string[]>> = {
  tag: ['name'],
};

const NAME_FIELD_BY_KIND: Partial<Record<EntityKind, string>> = {
  screen: 'name',
  connection: 'name',
  check: 'name',
  item: 'name',
  dungeon: 'name',
  area: 'name',
  location: 'name',
  actor: 'name',
  tag: 'name',
  'item-group': 'label',
  enumeration: 'label',
};

const CONTAINER_KINDS: readonly FieldDescriptor['kind'][] = ['object', 'union', 'array'];
const NO_TARGET_FIELDS: readonly IdRefTargetField[] = [];

const NO_OPTIONS: readonly IdRefOption[] = [];
const NARROWED_KIND: EntityKind = 'location';
const AREA_FIELD = 'areaId';

const NO_TAG_SUGGESTIONS: readonly string[] = [];

const OVERWORLD_KIND = 'overworld';
const OVERWORLD_GRID = { x: { min: 0, max: 7 }, y: { min: 0, max: 7 } };
const ROOM_GRID = { x: { min: 0, max: 15 }, y: { min: 0, max: 14 } };
const SCREEN_FLOOR: NumberBounds = { min: -7, max: 6 };
const SCREEN_TILE: NumberBounds = { min: 0, max: 63 };

const NO_SERIALIZER = '// This collection has no source emitter.';
const EMIT_FAILED = 'could not be emitted';

const DEFAULT_KIND: EntityKind = 'screen';
const DEFAULT_TAB: DetailTab = 'json';
const NO_COLUMNS: readonly TableColumn[] = [];
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const CLOSED_DELETE_DIALOG: DeleteGuardDialogState = { open: false, hits: [] };

const ID_REF_SELECTOR = '[data-id-ref]';

const NOTHING_MATCHES = 'No records match these filters.';
const NO_FINDINGS = 'No open findings. The dataset agrees with everything seen so far.';
const COMPARISON_TITLE = 'Comparison';

const EXPAND_LABEL = 'Expand';
const COLLAPSE_LABEL = 'Collapse';

const DETAIL_TABS: TabItem[] = [
  { id: 'json', label: 'JSON' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'editor', label: 'Editor' },
];

const NOTHING_SELECTED = 'Select a record to inspect it.';

const READ_ONLY_NOTE = 'No write path is wired for this collection yet. This form reads the record, it cannot save it.';

const IDENTITY_PATH = 'id';

const MAX_BLANK_DEPTH = 4;

export { isEntityKind } from './behavior/is-entity-kind';
export { queryViewKey } from './behavior/query-view-key';
export { tableViewKey } from './behavior/table-view-key';

export {
  AREA_FIELD, CLOSED_DELETE_DIALOG, COLLAPSE_LABEL, COMPARISON_TITLE, CONTAINER_KINDS, CREATE_ONLY_EXCLUDED,
  DEFAULT_KIND, DEFAULT_TAB, DETAIL_TABS, EMIT_FAILED, EMPTY_PLACEMENT, ENTITY_KINDS, EXPAND_LABEL,
  FALLBACK_NAV_ICON, ID_REF_SELECTOR, IDENTITY_PATH, KIND_NAV_ITEMS, MAX_BLANK_DEPTH, NAME_FIELD_BY_KIND, NARROWED_KIND, NAV_ICONS, NAV_ITEMS,
  NO_COLUMNS, NO_FINDINGS, NO_OPTIONS, NO_SERIALIZER, NO_SOURCE_FILE, NO_TABLE, NO_TAG_SUGGESTIONS,
  NO_TARGET_FIELDS, NOTHING_MATCHES, NOTHING_SELECTED, OVERWORLD_GRID, OVERWORLD_KIND, READ_ONLY_NOTE,
  RECOMMENDATIONS_KIND, RECOMMENDATIONS_NAV_ITEM, ROOM_GRID, SCREEN_FLOOR, SCREEN_TILE, TAG_NAME_MISMATCH,
  TAG_NO_SCOPE, TAG_NOT_CONVENTION,
};
