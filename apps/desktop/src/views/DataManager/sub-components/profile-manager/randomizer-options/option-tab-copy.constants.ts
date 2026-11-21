/* @layer renderer-components @kind constants */
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { SubjectFixedTabId, UpcomingTabId } from './option-tab-copy.type';

const SUBJECT_FIXED_TABS: ReadonlySet<OptionTabId> =
  new Set<SubjectFixedTabId>(['world', 'goal', 'items', 'shops', 'dungeon']);

const UPCOMING_TABS: ReadonlySet<OptionTabId> = new Set<UpcomingTabId>([
  'environmental', 'entrance', 'traps', 'minigames', 'timer', 'enemies', 'glitches',
]);

export { SUBJECT_FIXED_TABS, UPCOMING_TABS };
