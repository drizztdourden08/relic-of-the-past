/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { enumerationFor } from '@rotp/game-data';
import type { EntityKind, ReviewStatus } from '@rotp/game-data';
import type { Recommendation } from '@rotp/navigation';
import type { LiveRecord, RecommendationFilter } from './LiveDataInspector.type';

const DEFAULT_KIND: EntityKind = 'screen';

const NO_RECORDS_MESSAGE = msg('views-live-data-inspector:records.empty');
const SPAWNS_PATH = 'spawns';

const NO_LIVE_RECORDS: readonly LiveRecord[] = [];

const PASS_DEBOUNCE_MS = 600;

const MISSING_PART = -1;

const FILTER_ORDER: readonly RecommendationFilter[] = ['all', 'update', 'create', 'delete'];

const FILTER_LABELS: Record<RecommendationFilter, Message> = {
  all: msg('views-live-data-inspector:filter.all'), update: msg('views-live-data-inspector:filter.update'), create: msg('views-live-data-inspector:filter.create'), delete: msg('views-live-data-inspector:filter.delete'),
};

const ACTION_LABEL: Record<Recommendation['action'], Message> = {
  create: msg('views-live-data-inspector:action.create'), update: msg('views-live-data-inspector:action.update'), delete: msg('views-live-data-inspector:action.delete'),
};

const MIN_BATCH = 2;

const EDIT_LABEL = msg('views-live-data-inspector:edit');

const REVIEW_TITLE = msg('views-live-data-inspector:review.title');
const REVIEW_NEVER = msg('views-live-data-inspector:review.never');
const REVIEW_UNTOUCHED: ReviewStatus = 'untouched';
const REVIEW_STATUS_OPTIONS = enumerationFor('review-status').map(entry => ({ value: entry.value, label: entry.label }));

const SPAWNS_TITLE = msg('views-live-data-inspector:spawns.title');
const SPAWNS_NONE = msg('views-live-data-inspector:spawns.none');
const SPAWN_LIVE_ONLY_TITLE = msg('views-live-data-inspector:spawns.live-only');

export {
  ACTION_LABEL, DEFAULT_KIND, EDIT_LABEL, FILTER_LABELS, FILTER_ORDER, MIN_BATCH, MISSING_PART, NO_LIVE_RECORDS,
  NO_RECORDS_MESSAGE, PASS_DEBOUNCE_MS, REVIEW_NEVER, REVIEW_STATUS_OPTIONS, REVIEW_TITLE, REVIEW_UNTOUCHED, SPAWN_LIVE_ONLY_TITLE,
  SPAWNS_NONE, SPAWNS_PATH, SPAWNS_TITLE,
};
