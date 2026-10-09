/* @layer renderer-components @kind constants */
import { CHECK_FACET_DEFS } from '@rotp/game-data';
import type { ItemFilter, ShowMode } from '@rotp/game-data';
import type { IconPath, SegmentOption, TagPickerGroup } from '@drizztdourden08/tessera/primitives';
import type { StatusKey, TrackerPanels } from './ChecksTracker.type';

const CHECK_PATHS = [
  'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0',
];

const DOT_CIRCLES = [{ cx: 8, cy: 8, r: 4 }];

const RING_PATHS = [
  'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16',
];

const STACK_PATHS = [
  'M2.5 3.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m2-2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m-2 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z',
];

const LIST_PATHS = [
  'M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5',
];

const LIST_DETAIL_PATHS = [
  'M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
];

const GRID_PATHS = [
  'M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z',
];

const FUNNEL_PATHS = [
  'M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 1v.793l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.349L13.5 3.293V2.5z',
];

const TAG_PATHS = [
  'M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
  'M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm0 1h4.586l7 7L9 13.586l-7-7z',
];

const NESTED_PATHS = [
  'M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5',
];

const CLOSE_PATHS = [
  'M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z',
];

const CLOSED_PANELS: TrackerPanels = { filters: false, groupConfig: false, tags: false };

const SHOW_MODE_OPTIONS: SegmentOption<ShowMode>[] = [
  { value: 'items', label: 'Items', title: 'The item checks' },
  { value: 'events', label: 'Events', title: 'Story, dungeon, fairy and area events' },
  { value: 'both', label: 'Both', title: 'Everything' },
];

const ITEM_FILTER_OPTIONS: SegmentOption<ItemFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Non-rewards' },
];

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const TAG_GROUPS: TagPickerGroup[] = TAG_CATEGORIES.map((category) => ({
  id: category,
  label: category,
  options: CHECK_FACET_DEFS.filter(t => t.category === category).map(t => ({ value: t.id, label: t.label })),
}));

const TAG_MODE_OPTIONS: SegmentOption<'any' | 'all'>[] = [
  { value: 'any', label: 'Any', title: 'Match any active tag' },
  { value: 'all', label: 'All', title: 'Match every active tag' },
];

const MAX_DIMENSIONS = 5;

const STATUS_LABELS: Record<StatusKey, string> = {
  completed: 'Already collected',
  reachable: 'Reachable right now',
  blocked: 'Still out of reach',
  total: 'Every check',
};

const STATUS_SHAPES: Record<StatusKey, IconPath> = {
  completed: { d: CHECK_PATHS },
  reachable: { circles: DOT_CIRCLES },
  blocked: { d: RING_PATHS },
  total: { d: STACK_PATHS },
};

const SUMMARY_STATS: { key: StatusKey; label: string }[] = [
  { key: 'completed', label: 'taken' },
  { key: 'reachable', label: 'available' },
  { key: 'blocked', label: 'left' },
  { key: 'total', label: 'total' },
];

const EVENT_MARK = './logos/logo/logo-128.png';

export {
  CHECK_PATHS, CLOSED_PANELS, CLOSE_PATHS, DOT_CIRCLES, EVENT_MARK, FUNNEL_PATHS, GRID_PATHS, ITEM_FILTER_OPTIONS,
  LIST_DETAIL_PATHS, LIST_PATHS, MAX_DIMENSIONS, NESTED_PATHS, RING_PATHS, SHOW_MODE_OPTIONS,
  STACK_PATHS, STATUS_LABELS, STATUS_SHAPES, SUMMARY_STATS, TAG_GROUPS, TAG_MODE_OPTIONS, TAG_PATHS,
};
