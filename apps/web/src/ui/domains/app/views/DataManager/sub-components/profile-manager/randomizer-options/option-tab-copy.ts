/* @layer renderer-components @kind constants */
/**
 * The fixed copy of the options tabs: the heading a fixed block sits under,
 * and which tabs carry one. The two sets are also what the body BRANCHES on:
 * a subject grows a fixed section, or a whole tab is unbuilt, by gaining an
 * entry here, never by another comparison in the layout.
 */
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';

/** The heading every subject tab puts its own fixed rows under. */
const SUBJECT_FIXED_TITLE = 'Fixed in this version';

/** The tabs that keep a fixed section of their own beneath their live rows. */
type SubjectFixedTabId = 'world' | 'goal' | 'items' | 'shops' | 'dungeon';

const SUBJECT_FIXED_TABS: ReadonlySet<OptionTabId> =
  new Set<SubjectFixedTabId>(['world', 'goal', 'items', 'shops', 'dungeon']);

/** A tab whose whole subject is still to be built. */
type UpcomingTabId =
  'environmental' | 'entrance' | 'traps' | 'minigames' | 'timer' | 'enemies' | 'glitches';

/** The one line an unbuilt tab shows, and the heading over any rows it already lists. */
const UPCOMING_TITLE = 'Not implemented yet';

const UPCOMING_TABS: ReadonlySet<OptionTabId> = new Set<UpcomingTabId>([
  'environmental', 'entrance', 'traps', 'minigames', 'timer', 'enemies', 'glitches',
]);

/** True for a tab declared unbuilt. The body branches on this. */
const isUpcomingTab = (tab: OptionTabId): tab is UpcomingTabId => UPCOMING_TABS.has(tab);

/** True for a tab that keeps a fixed section under its live rows. */
const isSubjectFixedTab = (tab: OptionTabId): tab is SubjectFixedTabId => SUBJECT_FIXED_TABS.has(tab);

export {
  SUBJECT_FIXED_TITLE,
  UPCOMING_TITLE,
  isSubjectFixedTab,
  isUpcomingTab,
};
export type { SubjectFixedTabId, UpcomingTabId };
