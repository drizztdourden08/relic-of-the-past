/* @layer renderer-app @kind constants */
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
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ConnectionPlacement, EntityKind } from '@rotp/game-data';
import type { DetailTab, FieldDescriptor, TableColumn, TableState } from '@drizztdourden08/tessera/data';
import type { IdRefTargetField, IdRefOption, NumberBounds } from '@drizztdourden08/tessera/composites';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { DeleteGuardDialogState, TableOrder } from './DataInspector.type';

const ENTITY_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor', 'tag',
  'item-group', 'enumeration',
];

const RECOMMENDATIONS_KIND = 'recommendations';

const KIND_NAV_ITEMS: { id: EntityKind; icon: IconName; label: Message }[] = [
  { id: 'screen', icon: 'map', label: msg('views-data-inspector:kind.screen.many') },
  { id: 'connection', icon: 'link', label: msg('views-data-inspector:kind.connection.many') },
  { id: 'check', icon: 'pin', label: msg('views-data-inspector:kind.check.many') },
  { id: 'item', icon: 'package', label: msg('views-data-inspector:kind.item.many') },
  { id: 'dungeon', icon: 'house', label: msg('views-data-inspector:kind.dungeon.many') },
  { id: 'area', icon: 'globe', label: msg('views-data-inspector:kind.area.many') },
  { id: 'location', icon: 'flag', label: msg('views-data-inspector:kind.location.many') },
  { id: 'actor', icon: 'bug', label: msg('views-data-inspector:kind.actor.many') },
  { id: 'tag', icon: 'tag', label: msg('views-data-inspector:kind.tag.many') },
  { id: 'item-group', icon: 'archive', label: msg('views-data-inspector:kind.item-group.many') },
  { id: 'enumeration', icon: 'type', label: msg('views-data-inspector:kind.enumeration.many') },
];

const RECOMMENDATIONS_NAV_ITEM: { id: string; icon: IconName; label: Message } = {
  id: RECOMMENDATIONS_KIND, icon: 'triangle-alert', label: msg('views-data-inspector:kind.recommendations.many'),
};

const KIND_LABELS: Record<string, Message> = Object.fromEntries(
  [...KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM].map(item => [item.id, item.label]),
);

const KIND_SINGULARS: Record<string, Message> = {
  'screen': msg('views-data-inspector:kind.screen.one'),
  'connection': msg('views-data-inspector:kind.connection.one'),
  'check': msg('views-data-inspector:kind.check.one'),
  'item': msg('views-data-inspector:kind.item.one'),
  'dungeon': msg('views-data-inspector:kind.dungeon.one'),
  'area': msg('views-data-inspector:kind.area.one'),
  'location': msg('views-data-inspector:kind.location.one'),
  'actor': msg('views-data-inspector:kind.actor.one'),
  'tag': msg('views-data-inspector:kind.tag.one'),
  'item-group': msg('views-data-inspector:kind.item-group.one'),
  'enumeration': msg('views-data-inspector:kind.enumeration.one'),
};

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

const NO_SOURCE_FILE = msg('views-data-inspector:err.noSourceFile');
const NOT_A_RECORD = msg('views-data-inspector:err.notARecord');
const TAG_NAME_MISMATCH = msg('views-data-inspector:err.tagNameMismatch');
const TAG_NOT_CONVENTION = msg('views-data-inspector:err.tagNotConvention');
const TAG_NO_SCOPE = msg('views-data-inspector:err.tagNoScope');

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

const NO_SERIALIZER = msg('views-data-inspector:err.noSerializer');

const DEFAULT_KIND: EntityKind = 'screen';
const DEFAULT_TAB: DetailTab = 'json';
const NO_COLUMNS: readonly TableColumn[] = [];
const NO_SCHEMA: readonly FieldDescriptor[] = [];
const NO_ROWS: readonly Record<string, unknown>[] = [];
const NO_ORDER: TableOrder = { sort: [], groupBy: [] };
const ROW_PAGE_SIZE = 100;
const NO_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

const CLOSED_DELETE_DIALOG: DeleteGuardDialogState = { open: false, hits: [] };

const ID_REF_SELECTOR = '[data-id-ref]';

const NOTHING_MATCHES = msg('views-data-inspector:list.empty');
const NO_FINDINGS = msg('views-data-inspector:list.no-findings');
const COMPARISON_TITLE = msg('views-data-inspector:comparison.title');

const RECORD_LIST_RATIO = 0.63;
const COMPARING_LIST_RATIO = 0.4;

const DETAIL_TABS: { id: string; label: Message }[] = [
  { id: 'json', label: msg('views-data-inspector:tabs.json') },
  { id: 'ts', label: msg('views-data-inspector:tabs.ts') },
  { id: 'editor', label: msg('views-data-inspector:tabs.editor') },
];

const NOTHING_SELECTED = msg('views-data-inspector:detail.empty');

const READ_ONLY_NOTE = msg('views-data-inspector:editor.read-only');

export {
  AREA_FIELD, CLOSED_DELETE_DIALOG, COMPARING_LIST_RATIO, COMPARISON_TITLE, CONTAINER_KINDS, CREATE_ONLY_EXCLUDED,
  DEFAULT_KIND, DEFAULT_TAB, DETAIL_TABS, EMPTY_PLACEMENT, ENTITY_KINDS,
  FALLBACK_NAV_ICON, ID_REF_SELECTOR, KIND_LABELS, KIND_NAV_ITEMS, KIND_SINGULARS, NAME_FIELD_BY_KIND, NARROWED_KIND, NAV_ICONS,
  NO_COLUMNS, NO_FINDINGS, NO_OPTIONS, NO_ORDER, NO_ROWS, NO_SCHEMA, NO_SERIALIZER, NO_SOURCE_FILE, NO_TABLE, NO_TAG_SUGGESTIONS,
  NO_TARGET_FIELDS, NOT_A_RECORD, NOTHING_MATCHES, NOTHING_SELECTED, OVERWORLD_GRID, OVERWORLD_KIND, READ_ONLY_NOTE,
  RECOMMENDATIONS_KIND, RECOMMENDATIONS_NAV_ITEM, RECORD_LIST_RATIO, ROOM_GRID, ROW_PAGE_SIZE, SCREEN_FLOOR, SCREEN_TILE,
  TAG_NAME_MISMATCH, TAG_NO_SCOPE, TAG_NOT_CONVENTION,
};
