/* @layer shared-game @kind data */
import type { OptionGroup } from '../options.type';

const OPTION_GROUPS: readonly OptionGroup[] = [
  { id: 'scope', label: 'App Scope' },
  { id: 'world', label: 'World' },
  { id: 'goal', label: 'Goal' },
  { id: 'dungeon-items', label: 'Dungeon Items' },
  { id: 'items', label: 'Items' },
  { id: 'shops', label: 'Shops' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'timers', label: 'Timers' },
  { id: 'session', label: 'Shared session' },
  { id: 'other', label: 'Other' },
];

const MEDALLION_OPTION_KEYS: readonly string[] = ['misery_mire_medallion', 'turtle_rock_medallion'];

export { MEDALLION_OPTION_KEYS, OPTION_GROUPS };
