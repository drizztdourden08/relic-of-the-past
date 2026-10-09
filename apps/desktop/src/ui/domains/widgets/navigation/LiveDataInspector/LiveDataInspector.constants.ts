/* @layer renderer-widgets @kind constants */
import { enumerationFor } from '@rotp/game-data';
import type { EntityKind, ReviewStatus } from '@rotp/game-data';
import type { Recommendation } from '@rotp/navigation';
import { KIND_NAV_ITEMS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import type { LiveRecord, RecommendationFilter } from './LiveDataInspector.type';

const DEFAULT_KIND: EntityKind = 'screen';

const JOINABLE_KINDS: readonly EntityKind[] = ['screen', 'connection', 'check', 'actor', 'item', 'dungeon'];

const NO_RECORDS_MESSAGE = 'No record for this screen in this collection.';
const SPAWNS_PATH = 'spawns';

const NO_LIVE_RECORDS: readonly LiveRecord[] = [];

const PASS_DEBOUNCE_MS = 600;

const FILTER_ORDER: readonly RecommendationFilter[] = ['all', 'update', 'create', 'delete'];

const FILTER_LABELS: Record<RecommendationFilter, string> = {
  all: 'All', update: 'Changed', create: 'Missing', delete: 'Extra',
};

const COLLECTION_TABS = KIND_NAV_ITEMS.map(item => ({ id: item.id, label: item.label, icon: item.icon }));

const ACTION_LABEL: Record<Recommendation['action'], string> = {
  create: 'Add', update: 'Change', delete: 'Remove',
};

const MIN_BATCH = 2;

const EDIT_LABEL = 'Edit';

const REVIEW_TITLE = 'Review';
const REVIEW_NEVER = 'never';
const REVIEW_UNTOUCHED: ReviewStatus = 'untouched';
const REVIEW_STATUS_OPTIONS = enumerationFor('review-status').map(entry => ({ value: entry.value, label: entry.label }));

const SPAWNS_TITLE = 'Spawns';
const SPAWNS_NONE = 'No spawns recorded.';
const SPAWN_LIVE_ONLY_TITLE = 'Reported by the live game, not yet in this record.';

export {
  ACTION_LABEL, COLLECTION_TABS, DEFAULT_KIND, EDIT_LABEL, FILTER_LABELS, FILTER_ORDER, JOINABLE_KINDS, MIN_BATCH, NO_LIVE_RECORDS,
  NO_RECORDS_MESSAGE, PASS_DEBOUNCE_MS, REVIEW_NEVER, REVIEW_STATUS_OPTIONS, REVIEW_TITLE, REVIEW_UNTOUCHED, SPAWN_LIVE_ONLY_TITLE,
  SPAWNS_NONE, SPAWNS_PATH, SPAWNS_TITLE,
};
