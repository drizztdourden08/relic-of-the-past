/* @layer renderer-widgets @kind constants */
import type { CheckKind, ItemFilter, StatusFilter } from '@rotp/game-data';
import { CHECK_FACET_DEFS } from '@rotp/game-data';
import type { ListItemShape } from '@drizztdourden08/tessera/composites';
import type { IconName, SegmentOption, TagPickerGroup } from '@drizztdourden08/tessera/primitives';

const CHECK_TYPE_ICONS: Record<CheckKind, IconName> = {
  chest: 'package',
  npc: 'user',
  standing: 'sparkles',
  boss: 'bug',
  prize: 'trophy',
  keyDrop: 'key-round',
  potItem: 'archive',
  dig: 'wrench',
  bonk: 'zap',
  event: 'flag',
  'shop-slot': 'store',
  'pond-slot': 'gift',
};

const NO_STOP_ICON: IconName = 'arrow-right-to-line';

const ITEM_FILTERS: SegmentOption<ItemFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Junk' },
];

const STATUS_FILTERS: SegmentOption<StatusFilter>[] = [
  { value: 'all', label: 'All', title: 'Any status' },
  { value: 'reachable', icon: 'circle-dot', hint: { label: 'Reachable', description: 'Checks you can reach now' } },
  { value: 'completed', icon: 'check', hint: { label: 'Completed', description: 'Checks already done' } },
  { value: 'blocked', icon: 'circle', hint: { label: 'Blocked', description: 'Checks still out of reach' } },
];

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const FACET_GROUPS: TagPickerGroup[] = TAG_CATEGORIES.map((category) => ({
  id: category,
  options: CHECK_FACET_DEFS.filter((facet) => facet.category === category).map((facet) => ({ value: facet.id, label: facet.label })),
}));

const LIST_SHAPE: ListItemShape = { icon: true, columns: 1, action: false };

export { CHECK_TYPE_ICONS, FACET_GROUPS, ITEM_FILTERS, LIST_SHAPE, NO_STOP_ICON, STATUS_FILTERS };
