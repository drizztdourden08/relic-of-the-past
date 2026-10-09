/* @layer renderer-widgets @kind constants */
import type { LogKindDef } from '@drizztdourden08/tessera/composites';
import type { FilterState } from '@shared/game/logic/queries/check-grouping';
import type { LogKind } from './SimulatorWidget.type';

const SAFETY_CAP = 50_000;
const PAUSED_POLL_MS = 120;
const FEATURES_LATCH_WAIT_MS = 500;
const SEQUENCE_PREFIX = 'Sequence ';

const RECORD_REQUIRED = 'This suggestion is a code block; the writer now takes a record. '
  + 'Apply it from the Dataset widget, which builds the record.';
const CHECK_DISABLED_HINT = 'Check writing is not available in this build.';

const EMPTY_FILTER: FilterState = {
  searchQuery: '',
  activeFacets: [],
  tagMode: 'any',
  itemFilter: 'all',
  statusFilter: 'all',
};

const ALL_KINDS: LogKind[] = ['seq', 'area', 'screen', 'pos', 'backtrack', 'flood', 'reset', 'check', 'item', 'discover', 'move', 'unlock', 'outcome', 'info', 'debug'];

const KIND_LABEL: Record<LogKind, string> = {
  seq: 'Sequences',
  area: 'Areas',
  screen: 'Screens',
  pos: 'Positions',
  backtrack: 'Backtracks',
  flood: 'Flood',
  reset: 'Resets',
  check: 'Checks',
  item: 'Items',
  discover: 'Discoveries',
  move: 'Moves',
  unlock: 'Unlocks',
  outcome: 'Outcome',
  info: 'Info',
  debug: 'Debug',
};

const LOG_KINDS: LogKindDef[] = ALL_KINDS.map((kind) => ({ id: kind, label: KIND_LABEL[kind] }));

export {
  ALL_KINDS, CHECK_DISABLED_HINT, EMPTY_FILTER, FEATURES_LATCH_WAIT_MS, KIND_LABEL, LOG_KINDS, PAUSED_POLL_MS, RECORD_REQUIRED, SAFETY_CAP,
  SEQUENCE_PREFIX,
};
