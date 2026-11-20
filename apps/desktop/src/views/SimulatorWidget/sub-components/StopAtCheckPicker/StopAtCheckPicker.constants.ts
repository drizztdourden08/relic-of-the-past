/* @layer renderer-widgets @kind constants */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { CheckKind, ItemFilter, StatusFilter } from '@rotp/game-data';
import { CHECK_FACET_DEFS } from '@rotp/game-data';
import type { ListItemShape } from '@drizztdourden08/tessera/composites';
import type { IconName, SegmentOption, TagPickerGroup } from '@drizztdourden08/tessera/primitives';

const CHECK_TYPE_ICONS: Record<CheckKind, IconName> = {
  chest: 'package',
  npc: 'user',
  standing: 'sparkles',
  boss: 'skull',
  prize: 'trophy',
  keyDrop: 'key-round',
  potItem: 'archive',
  dig: 'shovel',
  bonk: 'tree',
  event: 'flag',
  'shop-slot': 'store',
  'pond-slot': 'water',
};

const NO_STOP_ICON: IconName = 'arrow-right-to-line';

const itemFilters = (t: I18n['t']): SegmentOption<ItemFilter>[] => [
  { value: 'all', label: t('views-simulator:filter.item.all') },
  { value: 'rewards', label: t('views-simulator:filter.item.rewards') },
  { value: 'non-rewards', label: t('views-simulator:filter.item.junk') },
];

const statusFilters = (t: I18n['t']): SegmentOption<StatusFilter>[] => [
  { value: 'all', label: t('views-simulator:filter.status.all'), title: t('views-simulator:filter.status.all.title') },
  { value: 'reachable', icon: 'circle-dot', hint: { label: t('views-simulator:filter.status.reachable'), description: t('views-simulator:filter.status.reachable.description') } },
  { value: 'completed', icon: 'check', hint: { label: t('views-simulator:filter.status.completed'), description: t('views-simulator:filter.status.completed.description') } },
  { value: 'blocked', icon: 'circle', hint: { label: t('views-simulator:filter.status.blocked'), description: t('views-simulator:filter.status.blocked.description') } },
];

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const facetGroups = (text: (value: Text) => string): TagPickerGroup[] => TAG_CATEGORIES.map((category) => ({
  id: category,
  options: CHECK_FACET_DEFS.filter((facet) => facet.category === category).map((facet) => ({ value: facet.id, label: text(facet.label) })),
}));

const LIST_SHAPE: ListItemShape = { icon: true, columns: 1, action: false };

export { CHECK_TYPE_ICONS, facetGroups, itemFilters, LIST_SHAPE, NO_STOP_ICON, statusFilters };
