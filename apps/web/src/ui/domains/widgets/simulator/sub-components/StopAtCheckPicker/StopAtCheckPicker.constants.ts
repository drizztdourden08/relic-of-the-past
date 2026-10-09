/* @layer renderer-widgets @kind constants */
import type { CheckKind } from '@shared/game/data';
import type { ItemFilterOption, StatusFilterOption } from './StopAtCheckPicker.type';

const CHECK_TYPE_ICONS: Record<CheckKind, string> = {
  chest: '🧰',
  npc: '🧑',
  standing: '✨',
  boss: '👹',
  prize: '🏆',
  keyDrop: '🗝️',
  potItem: '🏺',
  dig: '⛏️',
  bonk: '🌳',
  event: '⚑',
  'shop-slot': '🏪',
  'pond-slot': '⛲',
};

const ITEM_FILTERS: ItemFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Junk' },
];

const STATUS_FILTERS: StatusFilterOption[] = [
  { value: 'all', label: 'All', title: 'Any status' },
  { value: 'reachable', label: '●', title: 'Reachable' },
  { value: 'completed', label: '✓', title: 'Completed' },
  { value: 'blocked', label: '○', title: 'Blocked' },
];

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

export { CHECK_TYPE_ICONS, ITEM_FILTERS, STATUS_FILTERS, TAG_CATEGORIES };
