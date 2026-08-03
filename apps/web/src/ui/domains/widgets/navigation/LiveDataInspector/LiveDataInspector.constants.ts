/* @layer renderer-widgets @kind data */
/**
 * The tab strip reuses the Data Inspector's own `KIND_NAV_ITEMS` — same icons,
 * same order — so a reviewer who has seen the full inspector recognises the
 * collections here at a glance rather than learning a second iconography.
 *
 * There is no curated field allow-list anymore: the widget shows a record's
 * FULL set of fields, the same as the full Data Inspector does, rather than a
 * "glance, not everything" subset — see `use-current-records.ts` for the
 * (now potentially many) records a tab shows per screen.
 */
import type { EntityKind } from '@shared/game/data';

/** Default tab: every screen has a screen record; nothing else is guaranteed. */
const DEFAULT_KIND: EntityKind = 'screen';

/** Kinds `use-current-records.ts` can resolve one or more live records for. */
const JOINABLE_KINDS: readonly EntityKind[] = ['screen', 'connection', 'check', 'actor', 'item', 'dungeon'];

export { DEFAULT_KIND, JOINABLE_KINDS };
