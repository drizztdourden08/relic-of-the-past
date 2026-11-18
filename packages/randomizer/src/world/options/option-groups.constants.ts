/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { OptionGroup } from '../options.type';

const OPTION_GROUPS: readonly OptionGroup[] = [
  { id: 'scope', label: msg('randomizer:group.scope') },
  { id: 'world', label: msg('randomizer:group.world') },
  { id: 'goal', label: msg('randomizer:group.goal') },
  { id: 'dungeon-items', label: msg('randomizer:group.dungeonItems') },
  { id: 'items', label: msg('randomizer:group.items') },
  { id: 'shops', label: msg('randomizer:group.shops') },
  { id: 'enemies', label: msg('randomizer:group.enemies') },
  { id: 'timers', label: msg('randomizer:group.timers') },
  { id: 'session', label: msg('randomizer:group.session') },
  { id: 'other', label: msg('randomizer:group.other') },
];

const MEDALLION_OPTION_KEYS: readonly string[] = ['misery_mire_medallion', 'turtle_rock_medallion'];

export { MEDALLION_OPTION_KEYS, OPTION_GROUPS };
